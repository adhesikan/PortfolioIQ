"use client";

import { AlertTriangle } from "lucide-react";
import Link from "next/link";

interface SampleDisclaimerProps {
  compact?: boolean;
}

export default function SampleDisclaimer({ compact = false }: SampleDisclaimerProps) {
  if (compact) {
    return (
      <div className="rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 px-4 py-3">
        <div className="flex items-start gap-2">
          <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
          <p className="text-xs text-amber-800 dark:text-amber-300">
            <span className="font-semibold">EXAMPLE ONLY</span> — Sample trade history for demonstration. Not financial advice. Past performance is not indicative of future results. See our <Link href="/disclaimer" className="underline hover:text-amber-950 dark:hover:text-amber-200">Disclaimer</Link>.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 p-5">
      <div className="flex items-start gap-3">
        <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
        <div className="space-y-2">
          <p className="text-sm font-semibold text-amber-900 dark:text-amber-300">EXAMPLE ONLY — Demonstration Data</p>
          <ul className="text-xs text-amber-800 dark:text-amber-400 space-y-1.5">
            <li>Sample trade history is provided for demonstration and testing purposes only.</li>
            <li>This is not financial advice. Past performance is not indicative of future results.</li>
            <li>Reports are informational and based on example data. You are responsible for all trading decisions.</li>
            <li>No recommendation is being made to buy, sell, or hold any security or strategy.</li>
            <li>These examples may not reflect real market conditions, execution quality, slippage, commissions, taxes, or brokerage constraints.</li>
          </ul>
          <p className="text-xs text-amber-700 dark:text-amber-400 pt-1">
            By continuing, you agree to our <Link href="/terms" className="underline hover:text-amber-950 dark:hover:text-amber-200">Terms of Service</Link>, <Link href="/privacy" className="underline hover:text-amber-950 dark:hover:text-amber-200">Privacy Policy</Link>, and <Link href="/disclaimer" className="underline hover:text-amber-950 dark:hover:text-amber-200">Disclaimer</Link>.
          </p>
        </div>
      </div>
    </div>
  );
}
