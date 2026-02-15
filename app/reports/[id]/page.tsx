"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter, useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { Loader2, ArrowLeft, CheckCircle, XCircle, AlertTriangle, Calendar, TrendingDown, Pencil, Check, X } from "lucide-react";
import Link from "next/link";
import Tooltip from "@/components/Tooltip";
import SampleDisclaimer from "@/components/SampleDisclaimer";

interface FullReport {
  id: string;
  title?: string | null;
  leakScore: number;
  topLeaks: Array<{ title: string; severity: number; evidence: string; meaning: string; quickFix: string }>;
  keyStats: Record<string, any>;
  behaviorPatterns: string[];
  fixPlan: Array<{ day: number; task: string }>;
  riskChecklist: Array<{ item: string; status: string }>;
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
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const reportId = params?.id as string;
  const [report, setReport] = useState<FullReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleValue, setTitleValue] = useState("");
  const [savingTitle, setSavingTitle] = useState(false);

  useEffect(() => {
    if (!user) { router.push("/login"); return; }
    if (!reportId) return;
    fetch(`/api/reports/${reportId}`)
      .then((r) => r.json())
      .then((data) => setReport(data.report))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user, router, reportId]);

  if (!user) return null;

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

      <h2 className="text-xl font-semibold text-slate-900 mb-4 flex items-center gap-2">
        <TrendingDown className="h-5 w-5 text-red-500" />
        <Tooltip content="These are the biggest behavioral patterns costing you money. Each leak includes evidence from your trades, what it means, and a quick fix.">
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
              <Tooltip content="How much this leak is hurting your performance. Higher severity means a bigger impact on your results.">
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
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">Quick Fix</p>
                <p className="text-sm text-slate-700 font-medium">{leak.quickFix}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {report.behaviorPatterns && report.behaviorPatterns.length > 0 && (
        <div className="card mb-6">
          <Tooltip content="Recurring tendencies our AI detected in your trading behavior. These patterns shape your overall performance.">
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
          <Tooltip content="A personalized daily action plan to help you break bad habits and fix your biggest leaks over one week.">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">7-Day Fix Plan</h2>
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
