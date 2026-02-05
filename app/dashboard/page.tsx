"use client";

import { usePortfolio } from "@/contexts/PortfolioContext";
import { computeHoldingMetrics } from "@/lib/analytics";
import { scorePortfolio } from "@/lib/scoring";
import { defaultScenarios, runStressTest } from "@/lib/stress";
import { generateRebalancePlan, RebalancePreset } from "@/lib/rebalance";
import { Holding } from "@/lib/types";
import Tooltip from "@/components/Tooltip";
import Link from "next/link";
import { useState } from "react";

const rebalancePresets: RebalancePreset[] = [
  "Balanced Growth",
  "Growth + Income",
  "Conservative Income",
  "Aggressive Growth"
];

function EmptyState() {
  return (
    <div className="card text-center py-16 animate-fade-in">
      <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-slate-100">
        <svg className="h-10 w-10 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      </div>
      <h2 className="text-xl font-semibold text-slate-900 mb-2">No Portfolio Yet</h2>
      <p className="text-slate-600 mb-6 max-w-md mx-auto">
        Import your holdings to get personalized portfolio analytics, stress tests, and rebalancing suggestions.
      </p>
      <Link href="/import" className="btn-primary">
        Import Your Portfolio
      </Link>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="card">
            <div className="skeleton h-4 w-24 mb-3"></div>
            <div className="skeleton h-10 w-20 mb-2"></div>
            <div className="skeleton h-3 w-32"></div>
          </div>
        ))}
      </div>
      <div className="card">
        <div className="skeleton h-6 w-32 mb-4"></div>
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="skeleton h-10 w-full"></div>
          ))}
        </div>
      </div>
    </div>
  );
}

function PortfolioSelector({
  portfolios,
  activeId,
  onSelect
}: {
  portfolios: { id: string; name: string }[];
  activeId: string;
  onSelect: (id: string) => void;
}) {
  if (portfolios.length <= 1) return null;

  return (
    <div className="flex items-center gap-3 mb-6">
      <label className="text-sm font-medium text-slate-600">Viewing:</label>
      <select
        value={activeId}
        onChange={(e) => onSelect(e.target.value)}
        className="select max-w-xs"
      >
        {portfolios.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name}
          </option>
        ))}
      </select>
    </div>
  );
}

function ScoreCard({ score, total }: { score: { total: number; notes: string[] }; total: number }) {
  const getScoreColor = (s: number) => {
    if (s >= 80) return "text-green-600";
    if (s >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className="card">
      <Tooltip content="A composite score (0-100) measuring diversification, concentration risk, and asset allocation. Higher scores indicate better diversification.">
        <p className="metric-label mb-2">Portfolio Score</p>
      </Tooltip>
      <p className={`metric-value ${getScoreColor(score.total)}`}>{Math.round(score.total)}</p>
      <div className="mt-4 space-y-1">
        {score.notes.slice(0, 3).map((note, i) => (
          <p key={i} className="text-xs text-slate-500 flex items-start gap-2">
            <span className="mt-0.5 h-1.5 w-1.5 rounded-full bg-slate-300 shrink-0"></span>
            {note}
          </p>
        ))}
      </div>
    </div>
  );
}

function MetricsCard({ metrics }: { metrics: ReturnType<typeof computeHoldingMetrics> }) {
  return (
    <div className="card">
      <Tooltip content="Measures how much of your portfolio is concentrated in a single holding. Lower concentration generally means better diversification.">
        <p className="metric-label mb-2">Concentration</p>
      </Tooltip>
      <p className="metric-value">{(metrics.topWeights.top1 * 100).toFixed(0)}%</p>
      <Tooltip content="The percentage of your total portfolio value in your largest single holding.">
        <p className="text-sm text-slate-500 mt-1">Top holding weight</p>
      </Tooltip>
      <div className="mt-4 grid grid-cols-2 gap-4 pt-4 border-t border-slate-100">
        <div>
          <Tooltip content="Herfindahl-Hirschman Index: Measures market concentration. Lower values (under 15%) indicate good diversification. Over 25% suggests high concentration risk.">
            <p className="text-xs text-slate-500">HHI Index</p>
          </Tooltip>
          <p className="font-semibold text-slate-900">{(metrics.hhi * 100).toFixed(1)}%</p>
        </div>
        <div>
          <Tooltip content="The number of equally-weighted holdings that would produce the same concentration level. Higher numbers indicate better diversification.">
            <p className="text-xs text-slate-500">Effective Holdings</p>
          </Tooltip>
          <p className="font-semibold text-slate-900">{metrics.effectiveHoldings.toFixed(1)}</p>
        </div>
      </div>
    </div>
  );
}

function TotalValueCard({ holdings }: { holdings: Holding[] }) {
  const totalValue = holdings.reduce((sum, h) => {
    const price = h.lastPrice ?? h.avgCost ?? 0;
    return sum + h.quantity * price;
  }, 0);

  const holdingCount = holdings.length;
  const assetClasses = new Set(holdings.map((h) => h.assetClass)).size;

  return (
    <div className="card">
      <Tooltip content="The total amount you paid for all your holdings, calculated as quantity times average cost per share.">
        <p className="metric-label mb-2">Total Cost Basis</p>
      </Tooltip>
      <p className="metric-value">${totalValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
      <Tooltip content="This value is based on your average purchase price, not current market prices.">
        <p className="text-xs text-slate-400 mt-1">Based on your average cost</p>
      </Tooltip>
      <div className="mt-4 grid grid-cols-2 gap-4 pt-4 border-t border-slate-100">
        <div>
          <Tooltip content="The total number of individual securities in your portfolio.">
            <p className="text-xs text-slate-500">Holdings</p>
          </Tooltip>
          <p className="font-semibold text-slate-900">{holdingCount}</p>
        </div>
        <div>
          <Tooltip content="The number of different asset types (equity, ETF, bonds, crypto, etc.) represented in your portfolio.">
            <p className="text-xs text-slate-500">Asset Classes</p>
          </Tooltip>
          <p className="font-semibold text-slate-900">{assetClasses}</p>
        </div>
      </div>
    </div>
  );
}

function HoldingsTable({ holdings }: { holdings: Holding[] }) {
  const sortedHoldings = [...holdings].sort((a, b) => {
    const aVal = a.quantity * (a.lastPrice ?? a.avgCost ?? 0);
    const bVal = b.quantity * (b.lastPrice ?? b.avgCost ?? 0);
    return bVal - aVal;
  });

  return (
    <div className="card">
      <h2 className="section-title mb-4">Holdings</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200">
              <th className="pb-3 text-left font-medium text-slate-500">
                <Tooltip content="The stock or ETF ticker symbol that uniquely identifies the security.">
                  <span>Ticker</span>
                </Tooltip>
              </th>
              <th className="pb-3 text-right font-medium text-slate-500">
                <Tooltip content="The number of shares you own of this security.">
                  <span>Quantity</span>
                </Tooltip>
              </th>
              <th className="pb-3 text-right font-medium text-slate-500">
                <Tooltip content="Your average cost per share (what you paid), not the current market price.">
                  <span>Price</span>
                </Tooltip>
              </th>
              <th className="pb-3 text-right font-medium text-slate-500">
                <Tooltip content="Total value calculated as quantity multiplied by your average cost.">
                  <span>Value</span>
                </Tooltip>
              </th>
              <th className="pb-3 text-left font-medium text-slate-500">
                <Tooltip content="The asset category: Equity (stocks), ETF (exchange-traded funds), Fixed-Income (bonds), Crypto, or Other.">
                  <span>Class</span>
                </Tooltip>
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedHoldings.map((h, i) => {
              const price = h.lastPrice ?? h.avgCost ?? 0;
              const value = h.quantity * price;
              return (
                <tr key={i} className="border-b border-slate-100 last:border-0">
                  <td className="py-3 font-medium text-slate-900">{h.ticker}</td>
                  <td className="py-3 text-right text-slate-600">{h.quantity.toLocaleString()}</td>
                  <td className="py-3 text-right text-slate-600">${price.toFixed(2)}</td>
                  <td className="py-3 text-right font-medium text-slate-900">${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                  <td className="py-3">
                    <span className="tag">{h.assetClass}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const stressTestMitigations: Record<string, { tip: string; examples: string[] }> = {
  "2022 Rate Shock": {
    tip: "Consider adding short-duration bonds or value stocks that historically perform better when rates rise.",
    examples: ["VTIP (Treasury Inflation-Protected)", "SCHD (Dividend Value ETF)", "BND (Total Bond Market)"]
  },
  "Single Stock Shock": {
    tip: "Reduce single-stock concentration by diversifying across sectors or using broad market funds.",
    examples: ["VTI (Total Stock Market)", "SCHB (Broad Market ETF)", "ITOT (Core S&P Total)"]
  },
  "Global Recession": {
    tip: "Consider defensive sectors and international diversification to reduce correlation risk.",
    examples: ["VWO (Emerging Markets)", "VXUS (International Stocks)", "XLU (Utilities Sector)"]
  }
};

function StressTestsCard({ holdings }: { holdings: Holding[] }) {
  const [expandedScenario, setExpandedScenario] = useState<string | null>(null);
  const stress = defaultScenarios.map((scenario) => runStressTest(holdings, scenario));

  return (
    <div className="card">
      <Tooltip content="Simulations showing how your portfolio might perform under various adverse market conditions. These are hypothetical scenarios for educational purposes.">
        <h2 className="section-title mb-4">Stress Tests</h2>
      </Tooltip>
      <p className="text-sm text-slate-500 mb-4">Hypothetical impact under market scenarios</p>
      <div className="space-y-3">
        {stress.map((result) => {
          const isExpanded = expandedScenario === result.scenario;
          const mitigation = stressTestMitigations[result.scenario];
          return (
            <div 
              key={result.scenario} 
              className="rounded-xl bg-slate-50 p-4 cursor-pointer hover:bg-slate-100 transition-colors"
              onClick={() => setExpandedScenario(isExpanded ? null : result.scenario)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-slate-900">{result.scenario}</p>
                    <svg className={`h-4 w-4 text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">{defaultScenarios.find(s => s.name === result.scenario)?.description}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-red-600">{(result.impactPct * 100).toFixed(1)}%</p>
                  <p className="text-xs text-slate-500">${Math.abs(result.impactDollars).toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                </div>
              </div>
              {isExpanded && mitigation && (
                <div className="mt-4 pt-4 border-t border-slate-200">
                  <p className="text-sm text-slate-700 mb-3">{mitigation.tip}</p>
                  <div className="flex flex-wrap gap-2">
                    {mitigation.examples.map((example) => (
                      <span key={example} className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                        {example}
                      </span>
                    ))}
                  </div>
                  <p className="text-xs text-slate-400 mt-3 italic">
                    For educational purposes only. Not a recommendation to buy or sell any security.
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

const assetClassSuggestions: Record<string, { etfs: string[]; description: string }> = {
  cash: {
    etfs: ["SGOV (Treasury Bills)", "BIL (1-3 Month T-Bills)", "SHV (Short Treasury)"],
    description: "Short-term treasury ETFs for cash-equivalent holdings"
  },
  "fixed-income": {
    etfs: ["BND (Total Bond)", "AGG (Aggregate Bond)", "VCIT (Corporate Bond)"],
    description: "Diversified bond funds for fixed-income exposure"
  },
  etf: {
    etfs: ["VTI (Total Market)", "VOO (S&P 500)", "VWO (Emerging Markets)", "SMH (Semiconductors)"],
    description: "Broad market and sector ETFs for diversification"
  },
  equity: {
    etfs: ["VIG (Dividend Growth)", "SCHD (Dividend Value)", "QUAL (Quality Factor)"],
    description: "Quality-focused ETFs if looking to reduce single-stock risk"
  },
  crypto: {
    etfs: ["BITO (Bitcoin Strategy)", "ETHA (Ethereum)", "IBIT (Bitcoin Trust)"],
    description: "Regulated crypto exposure through ETFs"
  },
  other: {
    etfs: ["VNQ (Real Estate)", "DBC (Commodities)", "GLD (Gold)"],
    description: "Alternative asset class ETFs for diversification"
  }
};

function RebalanceCard({ holdings }: { holdings: Holding[] }) {
  const [preset, setPreset] = useState<RebalancePreset>("Balanced Growth");
  const [expandedTicker, setExpandedTicker] = useState<string | null>(null);
  const recommendations = generateRebalancePlan(holdings, preset);

  return (
    <div className="card">
      <div className="flex items-start justify-between mb-4">
        <div>
          <Tooltip content="Suggestions for adjusting your asset allocation based on the selected investment strategy. These are educational ideas, not personalized advice.">
            <h2 className="section-title">Rebalancing Ideas</h2>
          </Tooltip>
          <p className="text-sm text-slate-500 mt-1">Educational suggestions only</p>
        </div>
        <select
          value={preset}
          onChange={(e) => setPreset(e.target.value as RebalancePreset)}
          className="select text-sm w-auto"
        >
          {rebalancePresets.map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
      </div>
      <div className="space-y-3">
        {recommendations.length === 0 ? (
          <p className="text-sm text-slate-500 py-4 text-center">
            Your portfolio appears balanced for this strategy.
          </p>
        ) : (
          recommendations.map((rec, i) => {
            const isExpanded = expandedTicker === rec.ticker;
            const suggestions = assetClassSuggestions[rec.ticker.toLowerCase()] || assetClassSuggestions["other"];
            return (
              <div 
                key={i} 
                className="rounded-xl border border-slate-200 p-4 cursor-pointer hover:border-slate-300 transition-colors"
                onClick={() => setExpandedTicker(isExpanded ? null : rec.ticker)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-slate-900">{rec.ticker}</p>
                      <svg className={`h-4 w-4 text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">{rec.rationale}</p>
                  </div>
                  <div className={`text-right ${rec.action === "consider_buy" ? "text-green-600" : "text-orange-600"}`}>
                    <p className="font-semibold">{rec.action === "consider_buy" ? "+" : "-"}${rec.dollars.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                    <p className="text-xs">{rec.action === "consider_buy" ? "Consider adding" : "Consider trimming"}</p>
                  </div>
                </div>
                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-slate-200">
                    <p className="text-sm text-slate-700 mb-3">{suggestions.description}</p>
                    <p className="text-xs font-medium text-slate-600 mb-2">Example ETFs to explore:</p>
                    <div className="flex flex-wrap gap-2">
                      {suggestions.etfs.map((etf) => (
                        <span key={etf} className="inline-flex items-center rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-700">
                          {etf}
                        </span>
                      ))}
                    </div>
                    <p className="text-xs text-slate-400 mt-3 italic">
                      For educational purposes only. Research thoroughly before investing. This is not personalized investment advice.
                    </p>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { portfolios, activePortfolio, isLoading, setActivePortfolio } = usePortfolio();

  if (isLoading) {
    return (
      <div className="container-page">
        <LoadingState />
      </div>
    );
  }

  if (!activePortfolio || activePortfolio.holdings.length === 0) {
    return (
      <div className="container-page">
        <EmptyState />
      </div>
    );
  }

  const holdings: Holding[] = activePortfolio.holdings.map((h: any) => ({
    ...h,
    lastPrice: h.avgCost
  }));

  const metrics = computeHoldingMetrics(holdings);
  const score = scorePortfolio(holdings);

  const handleSelectPortfolio = (id: string) => {
    const portfolio = portfolios.find((p) => p.id === id);
    if (portfolio) setActivePortfolio(portfolio);
  };

  return (
    <div className="container-page animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{activePortfolio.name}</h1>
          <p className="text-sm text-slate-500">Last updated: {new Date(activePortfolio.createdAt).toLocaleDateString()}</p>
        </div>
        <Link href="/import" className="btn-secondary">
          + Add Holdings
        </Link>
      </div>

      <PortfolioSelector
        portfolios={portfolios}
        activeId={activePortfolio.id}
        onSelect={handleSelectPortfolio}
      />

      <div className="space-y-6">
        <section className="grid gap-6 lg:grid-cols-3">
          <ScoreCard score={score} total={score.total} />
          <MetricsCard metrics={metrics} />
          <TotalValueCard holdings={holdings} />
        </section>

        <HoldingsTable holdings={holdings} />

        <section className="grid gap-6 lg:grid-cols-2">
          <StressTestsCard holdings={holdings} />
          <RebalanceCard holdings={holdings} />
        </section>
      </div>
    </div>
  );
}
