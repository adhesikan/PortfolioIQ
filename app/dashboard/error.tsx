"use client";

import { useEffect } from "react";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Dashboard error:", error);
  }, [error]);

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-12">
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
        <h2 className="text-lg font-semibold text-red-800 mb-2">Something went wrong</h2>
        <p className="text-sm text-red-700 mb-2">Dashboard failed to load.</p>
        <details className="text-left mb-4">
          <summary className="text-xs text-red-600 cursor-pointer">Error details</summary>
          <pre className="mt-2 text-xs text-red-600 bg-red-100 p-3 rounded overflow-auto max-h-40 whitespace-pre-wrap break-words">
            {error?.message || "Unknown error"}
            {error?.stack ? "\n\n" + error.stack : ""}
          </pre>
        </details>
        <button
          onClick={reset}
          className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}
