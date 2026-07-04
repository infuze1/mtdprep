import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
import { HMRC_CATEGORIES, Transaction } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 60;

const MAX_FILE_BYTES = 10 * 1024 * 1024; // 10MB

const SYSTEM_PROMPT = `You are a UK bookkeeping assistant. The user has uploaded an HSBC bank statement PDF. Extract every transaction and return them as a JSON array.

For each transaction return:
- date (DD/MM/YYYY)
- description (the raw bank description, cleaned up slightly for readability)
- amount (number, positive for credits/income, negative for debits/expenses)
- type ("credit" or "debit")
- category (one of the HMRC categories below)
- confidence ("high", "medium", or "low")

HMRC categories to use:
- "Income" — money coming in (sales, payments received)
- "Motor expenses" — fuel, parking, vehicle maintenance, MOT
- "Office expenses" — stationery, printer ink, small equipment
- "Repairs and maintenance" — property repairs, maintenance costs
- "Professional fees" — accountant, solicitor, consultant fees
- "Insurance" — business insurance premiums
- "Finance charges" — bank fees, interest charges, loan payments
- "Other allowable expenses" — legitimate business expenses not fitting above
- "Personal" — clearly personal spending (supermarkets, restaurants, holidays, personal subscriptions)
- "Review needed" — ambiguous, not enough information to categorise

Return ONLY valid JSON, no explanation. Format:
{"transactions": [...]}`;

const VALID_CATEGORIES = new Set<string>(HMRC_CATEGORIES);

function parseModelJson(text: string): { transactions: unknown[] } {
  // Strip markdown code fences if the model wrapped its output
  let cleaned = text.trim();
  const fenceMatch = cleaned.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/);
  if (fenceMatch) cleaned = fenceMatch[1];

  // Fall back to the outermost JSON object if there's surrounding prose
  if (!cleaned.startsWith("{")) {
    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");
    if (start === -1 || end === -1 || end <= start) {
      throw new Error("Model response contained no JSON object");
    }
    cleaned = cleaned.slice(start, end + 1);
  }

  const parsed = JSON.parse(cleaned);
  if (!parsed || !Array.isArray(parsed.transactions)) {
    throw new Error("Model response missing transactions array");
  }
  return parsed;
}

function sanitiseTransactions(raw: unknown[]): Transaction[] {
  const out: Transaction[] = [];
  raw.forEach((item, i) => {
    if (typeof item !== "object" || item === null) return;
    const t = item as Record<string, unknown>;

    const amount = typeof t.amount === "number" ? t.amount : Number(t.amount);
    if (!Number.isFinite(amount)) return;

    const description =
      typeof t.description === "string" && t.description.trim()
        ? t.description.trim()
        : "Unknown transaction";

    const date = typeof t.date === "string" ? t.date : "";

    const category = VALID_CATEGORIES.has(t.category as string)
      ? (t.category as Transaction["category"])
      : "Review needed";

    const type: Transaction["type"] =
      t.type === "credit" || t.type === "debit"
        ? t.type
        : amount >= 0
          ? "credit"
          : "debit";

    const confidence: Transaction["confidence"] =
      t.confidence === "high" || t.confidence === "medium" || t.confidence === "low"
        ? t.confidence
        : "low";

    out.push({ id: `txn-${i}`, date, description, amount, type, category, confidence });
  });
  return out;
}

export async function POST(req: NextRequest) {
  let file: File | null = null;
  try {
    const formData = await req.formData();
    const entry = formData.get("file");
    if (entry instanceof File) file = entry;
  } catch {
    return NextResponse.json(
      { error: "Expected a multipart form upload with a 'file' field." },
      { status: 400 }
    );
  }

  if (!file) {
    return NextResponse.json({ error: "No file uploaded." }, { status: 400 });
  }
  if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
    return NextResponse.json(
      { error: "Please upload a PDF bank statement." },
      { status: 400 }
    );
  }
  if (file.size > MAX_FILE_BYTES) {
    return NextResponse.json(
      { error: "File is too large. Please upload a PDF under 10MB." },
      { status: 400 }
    );
  }
  if (file.size === 0) {
    return NextResponse.json({ error: "The uploaded file is empty." }, { status: 400 });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: "Server is not configured with an API key." },
      { status: 500 }
    );
  }

  const base64 = Buffer.from(await file.arrayBuffer()).toString("base64");

  const anthropic = new Anthropic();

  try {
    const message = await anthropic.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 8192,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "document",
              source: {
                type: "base64",
                media_type: "application/pdf",
                data: base64,
              },
            },
            {
              type: "text",
              text: "Extract and categorise every transaction in this statement.",
            },
          ],
        },
      ],
    });

    const textBlock = message.content.find((block) => block.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      return NextResponse.json(
        { error: "The statement could not be read. Please try a different PDF." },
        { status: 502 }
      );
    }

    const parsed = parseModelJson(textBlock.text);
    const transactions = sanitiseTransactions(parsed.transactions);

    if (transactions.length === 0) {
      return NextResponse.json(
        {
          error:
            "No transactions were found in this PDF. Please check it's an HSBC bank statement and try again.",
        },
        { status: 422 }
      );
    }

    return NextResponse.json({ transactions });
  } catch (err) {
    if (err instanceof Anthropic.APIError) {
      const detail =
        err.status === 400
          ? "The PDF could not be processed — it may be corrupted or password-protected."
          : "The statement service is temporarily unavailable. Please try again in a moment.";
      return NextResponse.json({ error: detail }, { status: 502 });
    }
    if (err instanceof SyntaxError || err instanceof Error) {
      return NextResponse.json(
        { error: "Could not read the transactions from this statement. Please try again." },
        { status: 502 }
      );
    }
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}
