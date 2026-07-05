import Stripe from "stripe";
import MarkPaid from "./MarkPaid";

interface SuccessPageProps {
  searchParams: { session_id?: string };
}

async function verifySession(sessionId: string): Promise<boolean> {
  if (!process.env.STRIPE_SECRET_KEY) return false;

  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["subscription"],
    });

    if (session.payment_status === "paid") return true;

    const subscription = session.subscription;
    if (subscription && typeof subscription !== "string") {
      return subscription.status === "active" || subscription.status === "trialing";
    }
    return false;
  } catch {
    return false;
  }
}

export default async function SuccessPage({ searchParams }: SuccessPageProps) {
  const sessionId = searchParams.session_id;
  const paid = sessionId ? await verifySession(sessionId) : false;

  if (!paid) {
    return (
      <main className="mx-auto max-w-md px-4 py-16 text-center">
        <h1 className="text-2xl font-extrabold text-body">Payment not confirmed</h1>
        <p className="mt-3 text-slate-500">
          We couldn&apos;t verify your payment. Please check your email for a receipt
          from Stripe, or contact support at{" "}
          <a href="mailto:hello@mtdprep.co.uk" className="text-brand-dark underline">
            hello@mtdprep.co.uk
          </a>
          .
        </p>
        <a
          href="https://app.mtdprep.co.uk"
          className="mt-6 inline-block rounded-lg bg-brand px-5 py-3 font-semibold text-white transition-colors hover:bg-brand-dark"
        >
          Back to MTDPrep →
        </a>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-md px-4 py-16 text-center">
      <MarkPaid />

      <span className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand">
        <svg
          className="h-7 w-7"
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

      <h1 className="text-2xl font-extrabold text-body">You&apos;re all set.</h1>
      <p className="mt-3 text-slate-500">
        MTDPrep Standard is now active on this device. Process unlimited statements —
        no restrictions.
      </p>

      <a
        href="https://app.mtdprep.co.uk"
        className="mt-6 inline-block rounded-lg bg-brand px-5 py-3 font-semibold text-white transition-colors hover:bg-brand-dark"
      >
        Start processing statements →
      </a>

      <hr className="my-6 border-borderc" />

      <p className="text-sm text-slate-500">
        Having trouble? If your access doesn&apos;t activate, clear your browser cache
        and try this link again.
      </p>
    </main>
  );
}
