const USAGE_KEY = "mtdprep_usage";

interface Usage {
  statementsUsed: number;
  firstUsed: string;
}

export function getUsage(): Usage | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(USAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (typeof parsed.statementsUsed !== "number") return null;
    return parsed as Usage;
  } catch {
    return null;
  }
}

export function recordStatementUsed(): void {
  if (typeof window === "undefined") return;
  try {
    const existing = getUsage();
    const usage: Usage = existing
      ? { ...existing, statementsUsed: existing.statementsUsed + 1 }
      : { statementsUsed: 1, firstUsed: new Date().toISOString() };
    window.localStorage.setItem(USAGE_KEY, JSON.stringify(usage));
  } catch {
    // localStorage unavailable (private browsing etc.) — soft gate, fail open
  }
}

export function hasUsedFreeStatement(): boolean {
  if (typeof window === "undefined") return false;
  // Paid users are never gated
  if (window.localStorage.getItem("mtdprep_paid") === "true") return false;

  const usage = getUsage();
  return (usage?.statementsUsed ?? 0) >= 1;
}
