"use client";

import { AlertTriangle } from "lucide-react";

interface SampleDisclaimerProps {
  compact?: boolean;
}

export default function SampleDisclaimer({ compact = false }: SampleDisclaimerProps) {
  if (compact) {
    return (
      <div className="rounded-lg bg-amber-50 border border-amber-200 px-4 py-3">
        <div className="flex items-start gap-2">
          <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
          <p className="text-xs text-amber-800">
            <span className="font-semibold">EXAMPLE ONLY</span> — Sample trade history for demonstration. Not financial advice. No guarantees. Past performance is not indicative of future results.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-amber-50 border border-amber-200 p-5">
      <div className="flex items-start gap-3">
        <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 shrink-0" />
        <div className="space-y-2">
          <p className="text-sm font-semibold text-amber-900">EXAMPLE ONLY — Demonstration Data</p>
          <ul className="text-xs text-amber-800 space-y-1.5">
            <li>Sample trade history is provided for demonstration and testing purposes only.</li>
            <li>This is not financial advice. No guarantees of any kind. Past performance is not indicative of future results.</li>
            <li>Reports are informational and based on example data. You are responsible for all trading decisions.</li>
            <li>No recommendation is being made to buy, sell, or hold any security or strategy.</li>
            <li>These examples may not reflect real market conditions, execution quality, slippage, commissions, taxes, or brokerage constraints.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
