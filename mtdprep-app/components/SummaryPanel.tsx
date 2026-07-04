"use client";

import { Transaction } from "@/lib/types";

interface SummaryPanelProps {
  transactions: Transaction[];
}

function formatGBP(amount: number): string {
  return amount.toLocaleString("en-GB", { style: "currency", currency: "GBP" });
}

export default function SummaryPanel({ transactions }: SummaryPanelProps) {
  const included = transactions.filter((t) => t.category !== "Personal");
  const personalCount = transactions.length - included.length;

  const totals = new Map<string, number>();
  for (const t of included) {
    totals.set(t.category, (totals.get(t.category) ?? 0) + t.amount);
  }

  const income = totals.get("Income") ?? 0;
  const expenses = included
    .filter((t) => t.category !== "Income")
    .reduce((sum, t) => sum + t.amount, 0);

  const rows = Array.from(totals.entries()).sort(([a], [b]) => {
    if (a === "Income") return -1;
    if (b === "Income") return 1;
    return a.localeCompare(b);
  });

  return (
    <aside className="rounded-xl border border-borderc bg-white p-5">
      <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-500">
        Summary by category
      </h2>

      <ul className="divide-y divide-borderc/60 text-sm">
        {rows.map(([category, total]) => (
          <li key={category} className="flex items-center justify-between gap-4 py-2">
            <span className="text-body">{category}</span>
            <span
              className={`font-semibold ${total < 0 ? "text-red-600" : "text-green-700"}`}
            >
              {formatGBP(total)}
            </span>
          </li>
        ))}
      </ul>

      <div className="mt-3 space-y-1 border-t border-borderc pt-3 text-sm">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-body">Total income</span>
          <span className="font-bold text-green-700">{formatGBP(income)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="font-semibold text-body">Total expenses</span>
          <span className="font-bold text-red-600">{formatGBP(expenses)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="font-semibold text-body">Net</span>
          <span className="font-bold text-body">{formatGBP(income + expenses)}</span>
        </div>
      </div>

      {personalCount > 0 && (
        <p className="mt-3 text-xs text-slate-500">
          {personalCount} personal transaction{personalCount === 1 ? "" : "s"} excluded from
          the export.
        </p>
      )}
    </aside>
  );
}
