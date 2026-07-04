"use client";

import { useEffect, useState } from "react";
import UploadZone from "@/components/UploadZone";
import TransactionTable from "@/components/TransactionTable";
import SummaryPanel from "@/components/SummaryPanel";
import UpgradeModal from "@/components/UpgradeModal";
import { exportXlsx } from "@/lib/exportXlsx";
import { hasUsedFreeStatement, recordStatementUsed } from "@/lib/usage";
import { Transaction } from "@/lib/types";

export default function Home() {
  const [transactions, setTransactions] = useState<Transaction[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  useEffect(() => {
    if (hasUsedFreeStatement()) setShowUpgradeModal(true);
  }, []);

  async function handleFileSelected(file: File) {
    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/extract", { method: "POST", body: formData });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
        return;
      }

      setTransactions(data.transactions);
    } catch {
      setError("Could not reach the server. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    setTransactions(null);
    setError(null);
  }

  function updateTransaction(id: string, patch: Partial<Transaction>) {
    setTransactions((prev) =>
      prev ? prev.map((t) => (t.id === id ? { ...t, ...patch } : t)) : prev
    );
  }

  function handleDownload() {
    if (!transactions) return;
    exportXlsx(transactions);
    recordStatementUsed();
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      {showUpgradeModal && <UpgradeModal onDismiss={() => setShowUpgradeModal(false)} />}

      {!transactions ? (
        <>
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-extrabold text-body sm:text-3xl">
              Turn your HSBC statement into MTD-ready records
            </h1>
            <p className="mt-2 text-slate-500">
              Upload your PDF, review the HMRC categories, download a spreadsheet ready for
              your bridging software.
            </p>
          </div>

          <UploadZone onFileSelected={handleFileSelected} loading={loading} />

          {error && (
            <div
              role="alert"
              className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              {error}
            </div>
          )}
        </>
      ) : (
        <>
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-xl font-extrabold text-body sm:text-2xl">
                Review your transactions
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                {transactions.length} transactions extracted from your statement.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={reset}
                className="rounded-lg border border-borderc bg-white px-4 py-2 text-sm font-semibold text-body transition-colors hover:border-brand"
              >
                Upload a different statement
              </button>
              <button
                onClick={handleDownload}
                className="rounded-lg bg-brand px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-dark"
              >
                Download spreadsheet
              </button>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1fr_18rem] lg:items-start">
            <TransactionTable transactions={transactions} onUpdate={updateTransaction} />
            <SummaryPanel transactions={transactions} />
          </div>
        </>
      )}
    </main>
  );
}
