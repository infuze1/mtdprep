"use client";

import { useEffect } from "react";

export default function MarkPaid() {
  useEffect(() => {
    try {
      window.localStorage.setItem("mtdprep_paid", "true");
    } catch {
      // localStorage unavailable — nothing to do, the gate simply won't persist
    }
  }, []);

  return null;
}
