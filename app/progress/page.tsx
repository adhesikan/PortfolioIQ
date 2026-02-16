"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import {
  Loader2, TrendingUp, TrendingDown, ArrowRight, Lock, AlertCircle,
  BarChart3, Repeat, CheckCircle, XCircle, ArrowUpDown
} from "lucide-react";
import Link from "next/link";
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip as RechartsTooltip, Legend, Area, AreaChart, ReferenceLine
} from "recharts";

interface HistoryReport {
  id: string;
  title: string | null;
  leakScore: number;
  createdAt: string;
  isSample: boolean;
  sampleType: string | null;
  tradesCount: number;
  leakTitles: string[];
  winRate: number | null;
  profitFactor: number | null;
  avgRR: number | null;
}

interface RecurringLeak {
  title: string;
  occurrences: number;
  firstSeen: string;
  lastSeen: string;
  resolved: boolean;
}

type ChartMetric = "leakScore" | "winRate" | "profitFactor" | "avgRR";

const METRIC_CONFIG: Record<ChartMetric, { label: string; color: string; format: (v: number) => string; domain?: [number, number] }> = {
  leakScore: { label: "Leak Score", color: "#3b82f6", format: (v) => `${v}`, domain: [0, 100] },
  winRate: { label: "Win Rate", color: "#10b981", format: (v) => `${v}%` },
  profitFactor: { label: "Profit Factor", color: "#f59e0b", format: (v) => v.toFixed(2) },
  avgRR: { label: "Avg R:R", color: "#8b5cf6", format: (v) => `${v.toFixed(1)}:1` },
};

export default function ProgressPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [history, setHistory] = useState<HistoryReport[]>([]);
  const [recurringLeaks, setRecurringLeaks] = useState<RecurringLeak[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [compareA, setCompareA] = useState<string>("");
  const [compareB, setCompareB] = useState<string>("");
  const [activeMetric, setActiveMetric] = useState<ChartMetric>("leakScore");

  const isPro = user?.subscription?.status === "active" || user?.subscription?.status === "trialing";

  useEffect(() => {
    if (authLoading) return;
    if (!user) { router.push("/login"); return; }
    if (!isPro) { setLoading(false); return; }

    fetch("/api/reports/history")
      .then((r) => {
        if (r.status === 403) { setError("upgrade"); return null; }
        return r.json();
      })
      .then((data) => {
        if (!data) return;
        if (data.error) { setError(data.error); return; }
        const h = data.history || [];
        setHistory(h);
        setRecurringLeaks(data.recurringLeaks || []);
        const nonSample = h.filter((r: HistoryReport) => !r.isSample);
        const pickFrom = nonSample.length >= 2 ? nonSample : h;
        if (pickFrom.length >= 2) {
          setCompareA(pickFrom[pickFrom.length - 2].id);
          setCompareB(pickFrom[pickFrom.length - 1].id);
        }
      })
      .catch(() => setError("Failed to load data"))
      .finally(() => setLoading(false));
  }, [user, authLoading, router, isPro]);

  if (authLoading || !user) return null;

  if (!isPro) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 sm:px-6 py-16 text-center">
        <div className="card py-12">
          <Lock className="h-12 w-12 text-slate-300 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Historical Report Comparison</h1>
          <p className="text-sm text-slate-600 mb-6 max-w-md mx-auto">
            Track your progress over time by comparing Leak Scores, recurring patterns, and key metrics across all your reports.
          </p>
          <Link href="/pricing" className="btn-primary">
            Upgrade to Pro <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 text-brand-accent animate-spin" />
      </div>
    );
  }

  if (error) {
    if (error === "upgrade") {
      return (
        <div className="mx-auto w-full max-w-3xl px-4 sm:px-6 py-16 text-center">
          <div className="card py-12">
            <Lock className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Pro Feature</h1>
            <p className="text-sm text-slate-600 mb-6 max-w-md mx-auto">
              Upgrade to Pro to track your progress over time.
            </p>
            <Link href="/pricing" className="btn-primary">
              Upgrade to Pro <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      );
    }
    return (
      <div className="mx-auto max-w-3xl px-4 py-12 text-center">
        <AlertCircle className="h-8 w-8 text-red-400 mx-auto mb-3" />
        <p className="text-slate-600">{error}</p>
      </div>
    );
  }

  if (history.length < 2) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 sm:px-6 py-16 text-center">
        <div className="card py-12">
          <BarChart3 className="h-12 w-12 text-slate-300 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Not Enough Data Yet</h1>
          <p className="text-sm text-slate-600 mb-6 max-w-md mx-auto">
            Generate at least 2 Leak Reports to start tracking your progress and comparing results over time.
          </p>
          <Link href="/upload" className="btn-primary">
            Create a Report <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    );
  }

  const nonSampleReports = history.filter((r) => !r.isSample);
  const chartReports = nonSampleReports.length >= 2 ? nonSampleReports : history;

  const first = chartReports[0];
  const last = chartReports[chartReports.length - 1];
  const scoreDelta = last.leakScore - first.leakScore;
  const avgScore = Math.round(chartReports.reduce((s, r) => s + r.leakScore, 0) / chartReports.length);
  const bestScore = Math.max(...chartReports.map((r) => r.leakScore));

  const chartData = chartReports.map((r) => ({
    date: new Date(r.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
    leakScore: r.leakScore,
    winRate: r.winRate,
    profitFactor: r.profitFactor,
    avgRR: r.avgRR,
    fullDate: new Date(r.createdAt).toLocaleDateString(),
    title: r.title || (r.isSample ? "Sample" : "Report"),
  }));

  const mc = METRIC_CONFIG[activeMetric];

  const reportA = history.find((r) => r.id === compareA);
  const reportB = history.find((r) => r.id === compareB);

  const getLabel = (r: HistoryReport) =>
    r.title || (r.isSample ? `Sample` : `Report`) + ` — ${new Date(r.createdAt).toLocaleDateString()}`;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) return null;
    const data = payload[0].payload;
    return (
      <div className="bg-white border border-slate-200 rounded-lg shadow-lg p-3 text-xs">
        <p className="font-semibold text-slate-900 mb-1">{data.title}</p>
        <p className="text-slate-500 mb-2">{data.fullDate}</p>
        {payload.map((entry: any, i: number) => (
          <p key={i} className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-slate-600">{entry.name}:</span>
            <span className="font-medium text-slate-900">
              {entry.value != null ? mc.format(entry.value) : "—"}
            </span>
          </p>
        ))}
      </div>
    );
  };

  return (
    <div className="mx-auto w-full max-w-5xl px-4 sm:px-6 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Progress Tracker</h1>
        <p className="text-sm text-slate-600 mt-1">Compare your Leak Reports over time and track improvements</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="card text-center">
          <p className="text-3xl font-bold text-slate-900">{chartReports.length}</p>
          <p className="text-xs text-slate-500 mt-1">Total Reports</p>
        </div>
        <div className="card text-center">
          <p className={`text-3xl font-bold ${scoreDelta > 0 ? "text-green-600" : scoreDelta < 0 ? "text-red-600" : "text-slate-900"}`}>
            {scoreDelta > 0 ? "+" : ""}{scoreDelta}
          </p>
          <p className="text-xs text-slate-500 mt-1">Score Change</p>
        </div>
        <div className="card text-center">
          <p className="text-3xl font-bold text-green-600">{bestScore}</p>
          <p className="text-xs text-slate-500 mt-1">Best Score</p>
        </div>
        <div className="card text-center">
          <p className="text-3xl font-bold text-slate-900">{avgScore}</p>
          <p className="text-xs text-slate-500 mt-1">Average Score</p>
        </div>
      </div>

      <div className="card mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-brand-accent" />
            Progress Over Time
          </h2>
          <div className="flex rounded-lg border border-slate-200 overflow-hidden">
            {(Object.keys(METRIC_CONFIG) as ChartMetric[]).map((key) => (
              <button
                key={key}
                onClick={() => setActiveMetric(key)}
                className={`px-3 py-1.5 text-xs font-medium transition-colors border-l first:border-l-0 border-slate-200 ${
                  activeMetric === key
                    ? "bg-brand-accent text-white"
                    : "bg-white text-slate-600 hover:bg-slate-50"
                }`}
              >
                {METRIC_CONFIG[key].label}
              </button>
            ))}
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorMetric" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={mc.color} stopOpacity={0.2} />
                  <stop offset="95%" stopColor={mc.color} stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="#94a3b8" />
              <YAxis
                tick={{ fontSize: 11 }}
                stroke="#94a3b8"
                domain={mc.domain || ["auto", "auto"]}
                tickFormatter={(v) => mc.format(v)}
                width={50}
              />
              <RechartsTooltip content={<CustomTooltip />} />
              {activeMetric === "leakScore" && (
                <ReferenceLine y={avgScore} stroke="#94a3b8" strokeDasharray="3 3" label={{ value: `Avg: ${avgScore}`, position: "right", fontSize: 10, fill: "#94a3b8" }} />
              )}
              <Area
                type="monotone"
                dataKey={activeMetric}
                stroke={mc.color}
                strokeWidth={2.5}
                fill="url(#colorMetric)"
                dot={{ r: 5, fill: "white", stroke: mc.color, strokeWidth: 2 }}
                activeDot={{ r: 7, stroke: mc.color, strokeWidth: 2 }}
                name={mc.label}
                connectNulls
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {recurringLeaks.length > 0 && (
        <div className="card mb-8">
          <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <Repeat className="h-5 w-5 text-amber-500" />
            Recurring Leaks
          </h2>
          <p className="text-xs text-slate-500 mb-4">Leaks that appeared in 2+ reports. Fixing these will have the biggest impact.</p>
          <div className="space-y-3">
            {recurringLeaks.map((leak, i) => (
              <div key={i} className="flex items-center gap-4 p-3 rounded-lg bg-slate-50">
                <div className="shrink-0">
                  {leak.resolved ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">{leak.title}</p>
                  <p className="text-xs text-slate-500">
                    Appeared in {leak.occurrences} reports
                    {" · "}First: {new Date(leak.firstSeen).toLocaleDateString()}
                    {" · "}Last: {new Date(leak.lastSeen).toLocaleDateString()}
                  </p>
                </div>
                <span className={`text-xs font-medium px-2 py-1 rounded-full shrink-0 ${
                  leak.resolved ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                }`}>
                  {leak.resolved ? "Resolved" : "Active"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="card mb-8">
        <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <ArrowUpDown className="h-5 w-5 text-brand-accent" />
          Compare Two Reports
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="text-xs text-slate-500 font-medium mb-1 block">Report A</label>
            <select
              value={compareA}
              onChange={(e) => setCompareA(e.target.value)}
              className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-accent/30 bg-white"
            >
              <option value="">Select report...</option>
              {history.map((r) => (
                <option key={r.id} value={r.id}>{getLabel(r)}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-slate-500 font-medium mb-1 block">Report B</label>
            <select
              value={compareB}
              onChange={(e) => setCompareB(e.target.value)}
              className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-accent/30 bg-white"
            >
              <option value="">Select report...</option>
              {history.map((r) => (
                <option key={r.id} value={r.id}>{getLabel(r)}</option>
              ))}
            </select>
          </div>
        </div>

        {reportA && reportB && (
          <div className="border border-slate-200 rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-4 py-3 text-left font-medium text-slate-500">Metric</th>
                  <th className="px-4 py-3 text-center font-medium text-slate-700">
                    <span className="truncate block max-w-[150px] mx-auto">{getLabel(reportA)}</span>
                  </th>
                  <th className="px-4 py-3 text-center font-medium text-slate-700">
                    <span className="truncate block max-w-[150px] mx-auto">{getLabel(reportB)}</span>
                  </th>
                  <th className="px-4 py-3 text-center font-medium text-slate-500">Change</th>
                </tr>
              </thead>
              <tbody>
                {[
                  {
                    label: "Leak Score",
                    a: reportA.leakScore,
                    b: reportB.leakScore,
                    format: (v: number) => v.toString(),
                    higherIsBetter: true,
                  },
                  {
                    label: "Win Rate",
                    a: reportA.winRate,
                    b: reportB.winRate,
                    format: (v: number) => `${v}%`,
                    higherIsBetter: true,
                  },
                  {
                    label: "Profit Factor",
                    a: reportA.profitFactor,
                    b: reportB.profitFactor,
                    format: (v: number) => v.toFixed(2),
                    higherIsBetter: true,
                  },
                  {
                    label: "Avg R:R",
                    a: reportA.avgRR,
                    b: reportB.avgRR,
                    format: (v: number) => `${v}:1`,
                    higherIsBetter: true,
                  },
                  {
                    label: "Trades Analyzed",
                    a: reportA.tradesCount,
                    b: reportB.tradesCount,
                    format: (v: number) => v.toString(),
                    higherIsBetter: null,
                  },
                  {
                    label: "Leaks Found",
                    a: reportA.leakTitles.length,
                    b: reportB.leakTitles.length,
                    format: (v: number) => v.toString(),
                    higherIsBetter: false,
                  },
                ].map((row) => {
                  const delta = row.a != null && row.b != null ? row.b - row.a : null;
                  let deltaColor = "text-slate-500";
                  if (delta != null && delta !== 0 && row.higherIsBetter !== null) {
                    const isGood = row.higherIsBetter ? delta > 0 : delta < 0;
                    deltaColor = isGood ? "text-green-600" : "text-red-600";
                  }
                  return (
                    <tr key={row.label} className="border-b border-slate-100 last:border-0">
                      <td className="px-4 py-3 font-medium text-slate-700">{row.label}</td>
                      <td className="px-4 py-3 text-center text-slate-900">
                        {row.a != null ? row.format(row.a) : "—"}
                      </td>
                      <td className="px-4 py-3 text-center text-slate-900">
                        {row.b != null ? row.format(row.b) : "—"}
                      </td>
                      <td className={`px-4 py-3 text-center font-medium ${deltaColor}`}>
                        {delta != null ? (
                          <span className="flex items-center justify-center gap-1">
                            {delta > 0 ? <TrendingUp className="h-3.5 w-3.5" /> : delta < 0 ? <TrendingDown className="h-3.5 w-3.5" /> : null}
                            {delta > 0 ? "+" : ""}{typeof row.a === "number" && row.label === "Win Rate" ? `${delta}%` : row.label === "Profit Factor" ? delta.toFixed(2) : row.label === "Avg R:R" ? delta.toFixed(1) : delta}
                          </span>
                        ) : "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {reportA && reportB && (
              <div className="border-t border-slate-200 p-4 bg-slate-50">
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Leak Comparison</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-slate-500 mb-2">Report A Leaks</p>
                    {reportA.leakTitles.length > 0 ? (
                      <ul className="space-y-1">
                        {reportA.leakTitles.map((t, i) => {
                          const stillExists = reportB.leakTitles.includes(t);
                          return (
                            <li key={i} className="flex items-center gap-2 text-xs">
                              {stillExists ? (
                                <XCircle className="h-3.5 w-3.5 text-red-400 shrink-0" />
                              ) : (
                                <CheckCircle className="h-3.5 w-3.5 text-green-500 shrink-0" />
                              )}
                              <span className={stillExists ? "text-slate-700" : "text-green-700 line-through"}>{t}</span>
                            </li>
                          );
                        })}
                      </ul>
                    ) : (
                      <p className="text-xs text-slate-400">No leaks</p>
                    )}
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 mb-2">Report B Leaks</p>
                    {reportB.leakTitles.length > 0 ? (
                      <ul className="space-y-1">
                        {reportB.leakTitles.map((t, i) => {
                          const isNew = !reportA.leakTitles.includes(t);
                          return (
                            <li key={i} className="flex items-center gap-2 text-xs">
                              {isNew ? (
                                <AlertCircle className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                              ) : (
                                <XCircle className="h-3.5 w-3.5 text-red-400 shrink-0" />
                              )}
                              <span className={isNew ? "text-amber-700 font-medium" : "text-slate-700"}>
                                {t} {isNew && "(new)"}
                              </span>
                            </li>
                          );
                        })}
                      </ul>
                    ) : (
                      <p className="text-xs text-slate-400">No leaks</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="card mb-8">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">All Reports Timeline</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="px-3 py-2 text-left font-medium text-slate-500">Date</th>
                <th className="px-3 py-2 text-left font-medium text-slate-500">Report</th>
                <th className="px-3 py-2 text-center font-medium text-slate-500">Score</th>
                <th className="px-3 py-2 text-center font-medium text-slate-500">Win Rate</th>
                <th className="px-3 py-2 text-center font-medium text-slate-500">P.F.</th>
                <th className="px-3 py-2 text-center font-medium text-slate-500">Trades</th>
                <th className="px-3 py-2 text-center font-medium text-slate-500">Leaks</th>
                <th className="px-3 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {[...history].reverse().map((r) => (
                <tr key={r.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                  <td className="px-3 py-2.5 text-xs text-slate-500 whitespace-nowrap">
                    {new Date(r.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-3 py-2.5 text-sm text-slate-900 font-medium truncate max-w-[180px]">
                    {r.title || (r.isSample ? "Sample Report" : "Leak Report")}
                    {r.isSample && <span className="ml-1.5 text-[10px] text-amber-600 font-normal">(sample)</span>}
                  </td>
                  <td className="px-3 py-2.5 text-center">
                    <span className={`font-bold ${r.leakScore >= 70 ? "text-green-600" : r.leakScore >= 40 ? "text-yellow-600" : "text-red-600"}`}>
                      {r.leakScore}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-center text-slate-700">{r.winRate != null ? `${r.winRate}%` : "—"}</td>
                  <td className="px-3 py-2.5 text-center text-slate-700">{r.profitFactor != null ? r.profitFactor.toFixed(2) : "—"}</td>
                  <td className="px-3 py-2.5 text-center text-slate-700">{r.tradesCount}</td>
                  <td className="px-3 py-2.5 text-center text-slate-700">{r.leakTitles.length}</td>
                  <td className="px-3 py-2.5">
                    <Link href={`/reports/${r.id}`} className="text-brand-accent hover:underline text-xs">View</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="text-center py-4">
        <p className="text-xs text-slate-400">
          This tracking is for informational purposes only. Past performance does not indicate future results.
          Always do your own research and consult a qualified financial professional.
        </p>
      </div>
    </div>
  );
}
