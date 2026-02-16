"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter, useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { Loader2, ArrowLeft, CheckCircle, XCircle, AlertTriangle, Calendar, TrendingDown, Pencil, Check, X } from "lucide-react";
import Link from "next/link";
import Tooltip from "@/components/Tooltip";
import SampleDisclaimer from "@/components/SampleDisclaimer";

interface LeakDrivingTrade {
  tradeIndex?: number;
  symbol?: string;
  openDate?: string;
  closeDate?: string;
  pnl?: number;
  holdDays?: number;
  notes?: string;
}

interface LeakFixPlanItem {
  rule: string;
  howToApply: string;
  whyItHelps: string;
}

interface TopLeak {
  title: string;
  severity: number;
  evidence: string;
  meaning: string;
  quickFix: string;
  leakDrivingTrades?: LeakDrivingTrade[];
  fixPlan?: LeakFixPlanItem[];
}

interface ScoreBreakdownItem {
  category: string;
  label: string;
  score: number;
  maxScore: number;
  detail: string;
}

interface FullReport {
  id: string;
  title?: string | null;
  leakScore: number;
  topLeaks: TopLeak[];
  keyStats: Record<string, any>;
  behaviorPatterns: string[];
  fixPlan: Array<{ day: number; task: string }>;
  riskChecklist: Array<{ item: string; status: string }>;
  scoreBreakdown?: ScoreBreakdownItem[] | null;
  createdAt: string;
  isSample?: boolean;
  sampleType?: string | null;
}

const SAMPLE_LABELS: Record<string, string> = {
  DAY_TRADER: "Day Trader",
  SWING_TRADER: "Swing Trader",
  MESSY: "Messy Trader (High Leaks)",
  DISCIPLINED: "Disciplined Trader (Low Leaks)",
  OPTIONS: "Options Trader",
};

export default function ReportDetailPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const reportId = params?.id as string;
  const [report, setReport] = useState<FullReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleValue, setTitleValue] = useState("");
  const [savingTitle, setSavingTitle] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { router.push("/login"); return; }
    if (!reportId) return;
    fetch(`/api/reports/${reportId}`)
      .then((r) => r.json())
      .then((data) => setReport(data.report))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user, authLoading, router, reportId]);

  if (authLoading || !user) return null;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 text-brand-accent animate-spin" />
      </div>
    );
  }

  if (!report) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12 text-center">
        <p className="text-slate-600">Report not found.</p>
        <Link href="/reports" className="btn-primary mt-4 inline-flex">Back to Reports</Link>
      </div>
    );
  }

  const getDefaultTitle = () => report.isSample ? "Leak Report (Example)" : "Your Leak Report";

  const startEditingTitle = () => {
    setTitleValue(report.title || getDefaultTitle());
    setIsEditingTitle(true);
  };

  const cancelEditingTitle = () => {
    setIsEditingTitle(false);
    setTitleValue("");
  };

  const saveTitle = async () => {
    setSavingTitle(true);
    try {
      const res = await fetch(`/api/reports/${reportId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: titleValue }),
      });
      if (res.ok) {
        const data = await res.json();
        setReport((prev) => prev ? { ...prev, title: data.title } : prev);
      }
    } catch {}
    setSavingTitle(false);
    setIsEditingTitle(false);
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") saveTitle();
    else if (e.key === "Escape") cancelEditingTitle();
  };

  const scoreColor = report.leakScore >= 70 ? "text-green-600" : report.leakScore >= 40 ? "text-yellow-600" : "text-red-600";
  const scoreBg = report.leakScore >= 70 ? "stroke-green-500" : report.leakScore >= 40 ? "stroke-yellow-500" : "stroke-red-500";

  return (
    <div className="mx-auto w-full max-w-4xl px-4 sm:px-6 py-8 animate-fade-in">
      <Link href="/reports" className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 mb-6">
        <ArrowLeft className="h-4 w-4" />
        Back to Reports
      </Link>

      {report.isSample && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <span className="inline-flex items-center rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
              Example Data {report.sampleType ? `— ${SAMPLE_LABELS[report.sampleType] || report.sampleType}` : ""}
            </span>
          </div>
          <div className="p-4 rounded-lg bg-blue-50 border border-blue-200 mb-3">
            <p className="text-sm font-medium text-blue-900">Example Data</p>
            <p className="text-sm text-blue-800 mt-1">This report was generated using sample trades for demonstration purposes and does not count toward your free reports.</p>
          </div>
          <SampleDisclaimer />
        </div>
      )}

      <div className="rounded-lg bg-blue-50 border border-blue-200 p-4 mb-6">
        <p className="text-xs font-semibold text-blue-900 mb-1">Important</p>
        <p className="text-xs text-blue-800">
          This report summarizes patterns from the data you provided and may contain errors. It does not provide investment advice or recommendations. Use it as a structured review and verify any metrics before using it in your trading plan.
        </p>
      </div>

      <div className="card mb-6">
        <div className="flex flex-col md:flex-row items-center gap-8">
          <div className="flex-shrink-0">
            <div className="relative h-36 w-36">
              <svg className="h-36 w-36 transform -rotate-90" viewBox="0 0 160 160">
                <circle cx="80" cy="80" r="70" fill="none" stroke="#e2e8f0" strokeWidth="12" />
                <circle cx="80" cy="80" r="70" fill="none" className={scoreBg} strokeWidth="12"
                  strokeDasharray={`${(report.leakScore / 100) * 440} 440`} strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={`text-4xl font-bold ${scoreColor}`}>{report.leakScore}</span>
                <Tooltip content="Your Leak Score rates your trading from 0-100. Higher is better. Below 40 means significant behavioral leaks. 70+ means you're trading with strong discipline.">
                  <span className="text-xs text-slate-500">Leak Score</span>
                </Tooltip>
              </div>
            </div>
          </div>
          <div className="flex-1 text-center md:text-left">
            {isEditingTitle ? (
              <div className="flex items-center gap-2 mb-1">
                <input
                  type="text"
                  value={titleValue}
                  onChange={(e) => setTitleValue(e.target.value)}
                  onKeyDown={handleTitleKeyDown}
                  maxLength={100}
                  autoFocus
                  className="text-2xl font-bold text-slate-900 border border-brand-accent rounded-lg px-3 py-1 outline-none focus:ring-2 focus:ring-brand-accent/30 w-full max-w-md"
                />
                <button onClick={saveTitle} disabled={savingTitle} className="p-1.5 rounded-lg hover:bg-green-100 text-green-600 transition-colors">
                  <Check className="h-5 w-5" />
                </button>
                <button onClick={cancelEditingTitle} className="p-1.5 rounded-lg hover:bg-red-100 text-red-500 transition-colors">
                  <X className="h-5 w-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 mb-1 group/title">
                <h1 className="text-2xl font-bold text-slate-900">
                  {report.title || getDefaultTitle()}
                </h1>
                <button
                  onClick={startEditingTitle}
                  className="p-1.5 rounded-lg opacity-0 group-hover/title:opacity-100 hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-all"
                  title="Rename report"
                >
                  <Pencil className="h-4 w-4" />
                </button>
              </div>
            )}
            <p className="text-sm text-slate-500 flex items-center gap-1 justify-center md:justify-start">
              <Calendar className="h-3.5 w-3.5" />
              {new Date(report.createdAt).toLocaleDateString()}
            </p>
            {report.keyStats && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
                {[
                  { label: "Win Rate", value: report.keyStats.winRate != null ? `${Math.round(report.keyStats.winRate * 100)}%` : "—", tip: "The percentage of your trades that were profitable. Above 50% is generally good, but depends on your risk-to-reward ratio." },
                  { label: "Avg R:R", value: report.keyStats.avgRR != null ? `${report.keyStats.avgRR.toFixed(1)}:1` : "—", tip: "Average Risk-to-Reward ratio. This compares your average win size to your average loss. A 2:1 ratio means your wins are twice as large as your losses." },
                  { label: "Trades", value: report.keyStats.totalTrades ?? "—", tip: "The total number of trades analyzed in this report." },
                  { label: "Profit Factor", value: report.keyStats.profitFactor != null ? report.keyStats.profitFactor.toFixed(2) : "—", tip: "Total gross profit divided by total gross loss. Above 1.0 means you're profitable overall. Above 2.0 is strong." },
                ].map((stat, i) => (
                  <div key={i} className="text-center p-3 rounded-lg bg-slate-50">
                    <p className="text-lg font-bold text-slate-900">{stat.value}</p>
                    <Tooltip content={stat.tip}>
                      <p className="text-xs text-slate-500">{stat.label}</p>
                    </Tooltip>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {report.scoreBreakdown && report.scoreBreakdown.length > 0 && (
        <div className="card mb-6">
          <Tooltip content="Your Leak Score is calculated deterministically from 7 measurable dimensions of your trading data. Each bar shows how you scored in that area.">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Score Breakdown</h2>
          </Tooltip>
          <div className="space-y-3">
            {report.scoreBreakdown.map((item, i) => {
              const pct = item.maxScore > 0 ? (item.score / item.maxScore) * 100 : 0;
              const barColor = pct >= 70 ? "bg-green-500" : pct >= 40 ? "bg-yellow-500" : "bg-red-500";
              return (
                <div key={i}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-slate-700">{item.label}</span>
                    <span className="text-xs text-slate-500">{item.score}/{item.maxScore}</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2.5">
                    <div className={`h-2.5 rounded-full ${barColor} transition-all`} style={{ width: `${pct}%` }} />
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">{item.detail}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <h2 className="text-xl font-semibold text-slate-900 mb-4 flex items-center gap-2">
        <TrendingDown className="h-5 w-5 text-red-500" />
        <Tooltip content="These are the biggest behavioral patterns detected in the data. Each leak includes evidence, what it may mean, and practical next steps to consider.">
          <span>Top Leaks Found</span>
        </Tooltip>
      </h2>
      <div className="space-y-4 mb-8">
        {(report.topLeaks || []).map((leak, i) => (
          <div key={i} className="card border-l-4 border-l-red-400">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-100 text-red-600 text-sm font-bold">{i + 1}</div>
                <h3 className="font-semibold text-slate-900">{leak.title}</h3>
              </div>
              <Tooltip content="How significant this pattern appears in the data. Higher severity suggests a larger potential impact on performance.">
                <span className="text-sm font-medium text-red-600">Severity: {leak.severity}/100</span>
              </Tooltip>
            </div>
            <div className="space-y-3 ml-11">
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">Evidence</p>
                <p className="text-sm text-slate-700">{leak.evidence}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">What It Means</p>
                <p className="text-sm text-slate-700">{leak.meaning}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">Practical Next Steps (to consider)</p>
                <p className="text-sm text-slate-700 font-medium">{leak.quickFix}</p>
              </div>

              {leak.leakDrivingTrades && leak.leakDrivingTrades.length > 0 && (
                <div className="mt-4 pt-4 border-t border-slate-100">
                  <Tooltip content="These specific trades from your history contributed most to this leak pattern.">
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">Trades Driving This Leak</p>
                  </Tooltip>
                  <div className="overflow-x-auto rounded-lg border border-slate-200">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200">
                          <th className="px-3 py-2 text-left font-medium text-slate-500">Symbol</th>
                          <th className="px-3 py-2 text-left font-medium text-slate-500">Open</th>
                          <th className="px-3 py-2 text-left font-medium text-slate-500">Close</th>
                          <th className="px-3 py-2 text-right font-medium text-slate-500">P&L</th>
                          <th className="px-3 py-2 text-right font-medium text-slate-500">Hold</th>
                          <th className="px-3 py-2 text-left font-medium text-slate-500">Why It Matters</th>
                        </tr>
                      </thead>
                      <tbody>
                        {leak.leakDrivingTrades.map((dt, j) => (
                          <tr key={j} className="border-b border-slate-100 last:border-0">
                            <td className="px-3 py-2 font-medium text-slate-900">{dt.symbol || "—"}</td>
                            <td className="px-3 py-2 text-slate-600">{dt.openDate || "—"}</td>
                            <td className="px-3 py-2 text-slate-600">{dt.closeDate || "—"}</td>
                            <td className={`px-3 py-2 text-right font-medium ${(dt.pnl ?? 0) >= 0 ? "text-green-600" : "text-red-600"}`}>
                              {dt.pnl != null ? `$${dt.pnl.toFixed(2)}` : "—"}
                            </td>
                            <td className="px-3 py-2 text-right text-slate-600">{dt.holdDays != null ? `${dt.holdDays}d` : "—"}</td>
                            <td className="px-3 py-2 text-slate-600 max-w-xs">{dt.notes || "—"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {leak.fixPlan && leak.fixPlan.length > 0 && (
                <div className="mt-4 pt-4 border-t border-slate-100">
                  <Tooltip content="Specific practices to consider testing in your trading process.">
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">Review Plan for This Leak</p>
                  </Tooltip>
                  <div className="space-y-3">
                    {leak.fixPlan.map((fp, j) => (
                      <div key={j} className="p-3 rounded-lg bg-green-50 border border-green-100">
                        <p className="text-sm font-semibold text-green-900">{fp.rule}</p>
                        <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <div>
                            <p className="text-[10px] font-medium text-green-700 uppercase tracking-wide">How to Apply</p>
                            <p className="text-xs text-green-800 mt-0.5">{fp.howToApply}</p>
                          </div>
                          <div>
                            <p className="text-[10px] font-medium text-green-700 uppercase tracking-wide">Why It Helps</p>
                            <p className="text-xs text-green-800 mt-0.5">{fp.whyItHelps}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {report.behaviorPatterns && report.behaviorPatterns.length > 0 && (
        <div className="card mb-6">
          <Tooltip content="Recurring tendencies detected in the trading data. These patterns may influence overall performance.">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Behavior Patterns</h2>
          </Tooltip>
          <ul className="space-y-2">
            {report.behaviorPatterns.map((p, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-blue-500 shrink-0"></span>
                {p}
              </li>
            ))}
          </ul>
        </div>
      )}

      {report.fixPlan && report.fixPlan.length > 0 && (
        <div className="card mb-6">
          <Tooltip content="A structured daily review plan with practice tasks to help you evaluate and refine your process over one week.">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">7-Day Review &amp; Practice Plan</h2>
          </Tooltip>
          <div className="space-y-3">
            {report.fixPlan.map((item, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-slate-50">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-accent text-white text-xs font-bold shrink-0">
                  D{item.day}
                </div>
                <p className="text-sm text-slate-700 pt-0.5">{item.task}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {report.riskChecklist && report.riskChecklist.length > 0 && (
        <div className="card mb-6">
          <Tooltip content="A checklist of risk management practices. Green means you're doing well, red means there's an issue, and yellow means caution.">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Risk Control Checklist</h2>
          </Tooltip>
          <div className="space-y-2">
            {report.riskChecklist.map((item, i) => (
              <div key={i} className="flex items-center gap-3 p-2">
                {item.status === "pass" && <CheckCircle className="h-5 w-5 text-green-500 shrink-0" />}
                {item.status === "fail" && <XCircle className="h-5 w-5 text-red-500 shrink-0" />}
                {item.status === "warning" && <AlertTriangle className="h-5 w-5 text-yellow-500 shrink-0" />}
                <span className="text-sm text-slate-700">{item.item}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="card bg-amber-50 border-amber-200">
        <p className="text-xs text-amber-800">
          {report.isSample
            ? "EXAMPLE ONLY — This report was generated from sample data for demonstration purposes. It is not financial advice, a trading recommendation, or a guarantee of future performance. These examples may not reflect real market conditions, execution quality, slippage, commissions, taxes, or brokerage constraints."
            : "This report is for informational and educational purposes only. It is not financial advice, a trading recommendation, or a guarantee of future performance. Always do your own research and consult a qualified financial professional."}
        </p>
        <p className="text-xs text-amber-600 mt-2">
          See our{" "}
          <Link href="/disclaimer" className="underline hover:text-amber-800">Disclaimer</Link>
          {", "}
          <Link href="/privacy" className="underline hover:text-amber-800">Privacy Policy</Link>
          {", and "}
          <Link href="/terms" className="underline hover:text-amber-800">Terms of Service</Link>.
        </p>
      </div>
    </div>
  );
}
