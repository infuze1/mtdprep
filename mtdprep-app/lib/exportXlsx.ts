import XLSX from "xlsx-js-style";
import { Transaction } from "@/lib/types";

const HEADER_STYLE = {
  font: { bold: true, color: { rgb: "FFFFFF" } },
  fill: { patternType: "solid", fgColor: { rgb: "2A8A6E" } },
};

const CURRENCY_FORMAT = "£#,##0.00";

/**
 * Derives the statement month (YYYY-MM) from the most common month among
 * transaction dates (DD/MM/YYYY). Falls back to the current month.
 */
function statementMonth(transactions: Transaction[]): string {
  const counts = new Map<string, number>();
  for (const t of transactions) {
    const match = t.date.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (match) {
      const key = `${match[3]}-${match[2]}`;
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
  }
  let best: string | null = null;
  let bestCount = 0;
  counts.forEach((count, key) => {
    if (count > bestCount) {
      best = key;
      bestCount = count;
    }
  });
  if (best) return best;

  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

function autoWidths(rows: (string | number)[][]): { wch: number }[] {
  const widths: number[] = [];
  for (const row of rows) {
    row.forEach((cell, i) => {
      const len = String(cell).length + 2;
      widths[i] = Math.max(widths[i] ?? 10, len);
    });
  }
  return widths.map((wch) => ({ wch: Math.min(wch, 50) }));
}

export function exportXlsx(transactions: Transaction[]): string {
  const included = transactions.filter((t) => t.category !== "Personal");

  // ── Sheet 1: Transactions ──
  const txnHeader = ["Date", "Description", "Amount", "Category"];
  const txnRows = included.map((t) => [t.date, t.description, t.amount, t.category]);
  const txnSheet = XLSX.utils.aoa_to_sheet([txnHeader, ...txnRows]);

  txnHeader.forEach((_, col) => {
    const ref = XLSX.utils.encode_cell({ r: 0, c: col });
    if (txnSheet[ref]) txnSheet[ref].s = HEADER_STYLE;
  });
  txnRows.forEach((_, i) => {
    const ref = XLSX.utils.encode_cell({ r: i + 1, c: 2 });
    if (txnSheet[ref]) txnSheet[ref].z = CURRENCY_FORMAT;
  });
  txnSheet["!cols"] = autoWidths([txnHeader, ...txnRows]);

  // ── Sheet 2: Summary ──
  const totals = new Map<string, number>();
  for (const t of included) {
    totals.set(t.category, (totals.get(t.category) ?? 0) + t.amount);
  }
  const summaryRows = Array.from(totals.entries()).sort(([a], [b]) => {
    if (a === "Income") return -1;
    if (b === "Income") return 1;
    return a.localeCompare(b);
  });

  const summaryHeader = ["Category", "Total £"];
  const summarySheet = XLSX.utils.aoa_to_sheet([summaryHeader, ...summaryRows]);

  summaryHeader.forEach((_, col) => {
    const ref = XLSX.utils.encode_cell({ r: 0, c: col });
    if (summarySheet[ref]) summarySheet[ref].s = HEADER_STYLE;
  });
  summaryRows.forEach((_, i) => {
    const ref = XLSX.utils.encode_cell({ r: i + 1, c: 1 });
    if (summarySheet[ref]) summarySheet[ref].z = CURRENCY_FORMAT;
  });
  summarySheet["!cols"] = autoWidths([summaryHeader, ...summaryRows]);

  // ── Workbook ──
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, txnSheet, "Transactions");
  XLSX.utils.book_append_sheet(workbook, summarySheet, "Summary");

  const filename = `MTDPrep-export-${statementMonth(included)}.xlsx`;
  XLSX.writeFile(workbook, filename);
  return filename;
}
