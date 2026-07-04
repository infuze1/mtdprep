"use client";

interface UpgradeModalProps {
  onDismiss: () => void;
}

export default function UpgradeModal({ onDismiss }: UpgradeModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-body/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="upgrade-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onDismiss();
      }}
    >
      <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-xl">
        <span className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-light">
          <svg
            className="h-6 w-6 text-brand"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 3v12" />
            <path d="M7 10l5 5 5-5" />
            <path d="M4 19h16" />
          </svg>
        </span>

        <h2 id="upgrade-title" className="text-xl font-extrabold text-body">
          You&apos;ve used your free statement
        </h2>
        <p className="mt-3 text-slate-500">
          MTDPrep is free for your first HMRC statement. To process more, upgrade to
          MTDPrep Standard.
        </p>
        <p className="mt-4 text-lg font-bold text-brand-dark">
          £19/month — unlimited statements
        </p>

        <a
          href="https://mtdprep.co.uk/#waitlist"
          className="mt-6 block w-full rounded-lg bg-brand px-5 py-3 font-semibold text-white transition-colors hover:bg-brand-dark"
        >
          Join the waitlist →
        </a>
        <button
          onClick={onDismiss}
          className="mt-3 w-full rounded-lg px-5 py-2 text-sm font-semibold text-slate-500 transition-colors hover:text-body"
        >
          Continue anyway
        </button>
      </div>
    </div>
  );
}
