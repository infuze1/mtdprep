import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MTDPrep — HSBC statement to MTD-ready records",
  description:
    "Upload your HSBC PDF bank statement, review HMRC-categorised transactions, and download a spreadsheet ready for your MTD bridging software.",
  robots: { index: false },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-GB">
      <body className="min-h-screen bg-bg font-sans text-body antialiased">
        <header className="sticky top-0 z-50 border-b border-borderc bg-white">
          <div className="mx-auto flex h-14 max-w-4xl items-center justify-between px-4">
            <a
              href="https://mtdprep.co.uk"
              className="flex items-center gap-2.5"
              aria-label="MTDPrep home"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand">
                <svg
                  className="h-4.5 w-4.5"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#ffffff"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M20 6L9 17l-5-5" />
                </svg>
              </span>
              <span className="text-lg font-extrabold tracking-tight text-brand-dark">
                MTDPrep
              </span>
            </a>

            <div className="flex items-center gap-6">
              <a
                href="https://mtdprep.co.uk/blog/"
                className="text-sm font-semibold text-slate-500 transition-colors hover:text-brand-dark"
              >
                Blog
              </a>
              <a
                href="https://mtdprep.co.uk/#waitlist"
                className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-dark"
              >
                Get early access
              </a>
            </div>
          </div>
        </header>
        {children}
      </body>
    </html>
  );
}
