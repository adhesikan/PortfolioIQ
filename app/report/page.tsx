"use client";

import { usePortfolio } from "@/contexts/PortfolioContext";
import { computeHoldingMetrics } from "@/lib/analytics";
import { scorePortfolio } from "@/lib/scoring";
import { defaultScenarios, runStressTest } from "@/lib/stress";
import Link from "next/link";
import { useState, useRef } from "react";

export default function ReportPage() {
  const { activePortfolio, isLoading } = usePortfolio();
  const [isGenerating, setIsGenerating] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    setIsGenerating(true);
    setTimeout(() => {
      window.print();
      setIsGenerating(false);
    }, 100);
  };

  if (isLoading) {
    return (
      <div className="container-page">
        <div className="card">
          <div className="skeleton h-8 w-48 mb-4"></div>
          <div className="skeleton h-4 w-full mb-2"></div>
          <div className="skeleton h-4 w-2/3"></div>
        </div>
      </div>
    );
  }

  if (!activePortfolio || activePortfolio.holdings.length === 0) {
    return (
      <div className="container-page">
        <div className="card text-center py-16 animate-fade-in">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-slate-100">
            <svg className="h-10 w-10 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-slate-900 mb-2">No Portfolio to Report</h2>
          <p className="text-slate-600 mb-6">Import a portfolio first to generate reports.</p>
          <Link href="/import" className="btn-primary">
            Import Portfolio
          </Link>
        </div>
      </div>
    );
  }

  const holdings = activePortfolio.holdings.map((h: any) => ({
    ...h,
    lastPrice: h.avgCost
  }));

  const metrics = computeHoldingMetrics(holdings);
  const score = scorePortfolio(holdings);
  const stress = defaultScenarios.map((scenario) => runStressTest(holdings, scenario));
  const totalValue = holdings.reduce((sum: number, h: any) => sum + h.quantity * (h.avgCost ?? 0), 0);

  return (
    <div className="container-page animate-fade-in">
      <div className="flex items-center justify-between mb-8 print:hidden">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Portfolio Report</h1>
          <p className="text-sm text-slate-500 mt-1">Generate and print your portfolio analysis</p>
        </div>
        <button onClick={handlePrint} disabled={isGenerating} className="btn-primary">
          {isGenerating ? "Generating..." : "Print / Save as PDF"}
        </button>
      </div>

      <div ref={reportRef} className="space-y-6 print:space-y-4">
        <div className="card print:border-0 print:shadow-none print:p-0">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">{activePortfolio.name}</h2>
              <p className="text-sm text-slate-500">
                Generated on {new Date().toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-slate-500">Portfolio Score</p>
              <p className="text-4xl font-bold text-brand-accent">{Math.round(score.total)}</p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3 mb-6">
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-xs text-slate-500 mb-1">Total Value</p>
              <p className="text-xl font-bold text-slate-900">
                ${totalValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </p>
            </div>
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-xs text-slate-500 mb-1">Holdings</p>
              <p className="text-xl font-bold text-slate-900">{holdings.length}</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-xs text-slate-500 mb-1">Top Holding Weight</p>
              <p className="text-xl font-bold text-slate-900">{(metrics.topWeights.top1 * 100).toFixed(1)}%</p>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="font-semibold text-slate-900 mb-3">Score Analysis</h3>
            <ul className="space-y-1">
              {score.notes.map((note, i) => (
                <li key={i} className="text-sm text-slate-600 flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-brand-accent shrink-0"></span>
                  {note}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="card print:border-0 print:shadow-none print:p-0">
          <h3 className="font-semibold text-slate-900 mb-4">Holdings Breakdown</h3>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="pb-2 text-left font-medium text-slate-500">Ticker</th>
                <th className="pb-2 text-right font-medium text-slate-500">Quantity</th>
                <th className="pb-2 text-right font-medium text-slate-500">Price</th>
                <th className="pb-2 text-right font-medium text-slate-500">Value</th>
                <th className="pb-2 text-right font-medium text-slate-500">Weight</th>
              </tr>
            </thead>
            <tbody>
              {holdings.map((h: any, i: number) => {
                const value = h.quantity * (h.avgCost ?? 0);
                const weight = totalValue > 0 ? (value / totalValue) * 100 : 0;
                return (
                  <tr key={i} className="border-b border-slate-100 last:border-0">
                    <td className="py-2 font-medium text-slate-900">{h.ticker}</td>
                    <td className="py-2 text-right text-slate-600">{h.quantity.toLocaleString()}</td>
                    <td className="py-2 text-right text-slate-600">${(h.avgCost ?? 0).toFixed(2)}</td>
                    <td className="py-2 text-right font-medium text-slate-900">${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                    <td className="py-2 text-right text-slate-600">{weight.toFixed(1)}%</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="card print:border-0 print:shadow-none print:p-0">
          <h3 className="font-semibold text-slate-900 mb-4">Stress Test Results</h3>
          <div className="space-y-3">
            {stress.map((result) => (
              <div key={result.scenario} className="flex items-center justify-between rounded-lg bg-slate-50 p-3">
                <div>
                  <p className="font-medium text-slate-900">{result.scenario}</p>
                  <p className="text-xs text-slate-500">
                    {defaultScenarios.find((s) => s.name === result.scenario)?.description}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-red-600">{(result.impactPct * 100).toFixed(1)}%</p>
                  <p className="text-xs text-slate-500">
                    -${Math.abs(result.impactDollars).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card bg-amber-50 border-amber-200 print:bg-amber-50">
          <h3 className="font-semibold text-amber-900 mb-2">Important Disclaimer</h3>
          <p className="text-sm text-amber-800">
            This report is for educational purposes only and does not constitute investment advice. 
            All analytics, scores, and recommendations are hypothetical and simplified. 
            Past performance does not guarantee future results. 
            Please consult with a qualified financial advisor before making investment decisions.
          </p>
        </div>
      </div>

      <style jsx global>{`
        @media print {
          body { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
          .print\\:hidden { display: none !important; }
          .print\\:border-0 { border: none !important; }
          .print\\:shadow-none { box-shadow: none !important; }
          .print\\:p-0 { padding: 0 !important; }
          .print\\:bg-amber-50 { background-color: #fffbeb !important; }
          header, footer, nav { display: none !important; }
        }
      `}</style>
    </div>
  );
}
