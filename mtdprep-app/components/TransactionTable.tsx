"use client";

import { Transaction } from "@/lib/types";
import CategoryDropdown from "@/components/CategoryDropdown";

interface TransactionTableProps {
  transactions: Transaction[];
  onUpdate: (id: string, patch: Partial<Transaction>) => void;
}

const CONFIDENCE_DOT: Record<Transaction["confidence"], string> = {
  high: "🟢",
  medium: "🟡",
  low: "🔴",
};

function formatAmount(amount: number): string {
  const formatted = Math.abs(amount).toLocaleString("en-GB", {
    style: "currency",
    currency: "GBP",
  });
  return amount < 0 ? `-${formatted}` : `+${formatted}`;
}

export default function TransactionTable({ transactions, onUpdate }: TransactionTableProps) {
  function setCategory(t: Transaction, category: Transaction["category"]) {
    if (category === "Personal" && t.category !== "Personal") {
      onUpdate(t.id, { category, previousCategory: t.category });
    } else {
      onUpdate(t.id, { category, previousCategory: undefined });
    }
  }

  function togglePersonal(t: Transaction) {
    if (t.category === "Personal") {
      onUpdate(t.id, {
        category: t.previousCategory ?? "Review needed",
        previousCategory: undefined,
      });
    } else {
      onUpdate(t.id, { category: "Personal", previousCategory: t.category });
    }
  }

  return (
    <div>
      {/* ── Mobile: card layout ── */}
      <div className="space-y-3 sm:hidden">
        {transactions.map((t) => {
          const isPersonal = t.category === "Personal";
          const needsReview = t.category === "Review needed";
          return (
            <div
              key={t.id}
              className={`rounded-xl border border-borderc bg-white p-4 ${
                isPersonal ? "opacity-60" : needsReview ? "border-amber-300 bg-amber-50" : ""
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-slate-500">
                    {t.date} · {CONFIDENCE_DOT[t.confidence]}
                  </p>
                  <input
                    type="text"
                    value={t.description}
                    onChange={(e) => onUpdate(t.id, { description: e.target.value })}
                    aria-label="Transaction description"
                    className="mt-0.5 w-full rounded-md border border-transparent bg-transparent py-0.5 text-sm font-semibold text-body outline-none focus:border-brand focus:bg-white"
                  />
                </div>
                <p
                  className={`shrink-0 text-sm font-bold ${
                    isPersonal
                      ? "text-slate-400 line-through"
                      : t.amount < 0
                        ? "text-red-600"
                        : "text-green-700"
                  }`}
                >
                  {formatAmount(t.amount)}
                </p>
              </div>
              <div className="mt-3 flex items-center justify-between gap-3">
                <CategoryDropdown value={t.category} onChange={(c) => setCategory(t, c)} />
                <label className="flex shrink-0 items-center gap-1.5 text-xs font-semibold text-slate-500">
                  <input
                    type="checkbox"
                    checked={isPersonal}
                    onChange={() => togglePersonal(t)}
                    className="h-4 w-4 cursor-pointer accent-brand"
                  />
                  Personal
                </label>
              </div>
              {needsReview && (
                <p className="mt-2 text-xs text-amber-700">Please choose a category</p>
              )}
            </div>
          );
        })}
      </div>

      {/* ── Desktop: table layout ── */}
      <div className="hidden overflow-x-auto rounded-xl border border-borderc bg-white sm:block">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-borderc bg-bg text-xs uppercase tracking-wide text-slate-500">
            <th className="px-4 py-3 font-semibold">Date</th>
            <th className="px-4 py-3 font-semibold">Description</th>
            <th className="px-4 py-3 font-semibold text-right">Amount</th>
            <th className="px-4 py-3 font-semibold">Category</th>
            <th className="px-4 py-3 font-semibold text-center">Confidence</th>
            <th className="px-4 py-3 font-semibold text-center">Personal</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((t) => {
            const isPersonal = t.category === "Personal";
            const needsReview = t.category === "Review needed";
            return (
              <tr
                key={t.id}
                className={`border-b border-borderc/60 last:border-b-0 ${
                  isPersonal ? "bg-slate-50 opacity-60" : needsReview ? "bg-amber-50" : ""
                }`}
              >
                <td className="whitespace-nowrap px-4 py-3 text-slate-500">{t.date}</td>
                <td className="px-4 py-2">
                  <input
                    type="text"
                    value={t.description}
                    onChange={(e) => onUpdate(t.id, { description: e.target.value })}
                    aria-label="Transaction description"
                    className="w-full min-w-[10rem] rounded-md border border-transparent bg-transparent px-2 py-1 font-medium text-body outline-none transition-colors hover:border-borderc focus:border-brand focus:bg-white"
                  />
                </td>
                <td
                  className={`whitespace-nowrap px-4 py-3 text-right font-semibold ${
                    isPersonal
                      ? "text-slate-400 line-through"
                      : t.amount < 0
                        ? "text-red-600"
                        : "text-green-700"
                  }`}
                >
                  {formatAmount(t.amount)}
                </td>
                <td className="px-4 py-2">
                  <CategoryDropdown value={t.category} onChange={(c) => setCategory(t, c)} />
                  {needsReview && (
                    <p className="mt-1 px-1 text-xs text-amber-700">
                      Please choose a category
                    </p>
                  )}
                </td>
                <td className="px-4 py-3 text-center" title={`${t.confidence} confidence`}>
                  {CONFIDENCE_DOT[t.confidence]}
                </td>
                <td className="px-4 py-3 text-center">
                  <input
                    type="checkbox"
                    checked={isPersonal}
                    onChange={() => togglePersonal(t)}
                    aria-label="Mark as personal (excluded from export)"
                    className="h-4 w-4 cursor-pointer accent-brand"
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      </div>
    </div>
  );
}
