export const HMRC_CATEGORIES = [
  "Income",
  "Motor expenses",
  "Office expenses",
  "Repairs and maintenance",
  "Professional fees",
  "Insurance",
  "Finance charges",
  "Other allowable expenses",
  "Personal",
  "Review needed",
] as const;

export type Category = (typeof HMRC_CATEGORIES)[number];

export type Confidence = "high" | "medium" | "low";

export interface Transaction {
  id: string;
  date: string; // DD/MM/YYYY
  description: string;
  amount: number; // positive = credit, negative = debit
  type: "credit" | "debit";
  category: Category;
  confidence: Confidence;
  /** Remembers the category a row had before being marked Personal, so untoggling restores it. */
  previousCategory?: Category;
}

export interface ExtractResponse {
  transactions: Transaction[];
}

export interface ExtractError {
  error: string;
}
