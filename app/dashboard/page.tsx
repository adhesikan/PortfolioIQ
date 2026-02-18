"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import {
  Upload, ArrowRight, AlertCircle, Loader2, TrendingUp, TrendingDown,
  Minus, Pencil, Check, X, Target, Zap, ArrowUpRight, ChevronRight,
  BarChart3, CheckCircle2, Circle, Lightbulb, Activity, Shield
} from "lucide-react";
import Link from "next/link";
import OnboardingModal from "@/components/OnboardingModal";

interface ReportSummary {
  id: string;
  title: string | null;
  leakScore: number;
  createdAt: string;
  tradesCount: number;
  isSample: boolean;
  sampleType: string | null;
}

interface LeakItem {
  name?: string;
  title?: string;
  severity?: string;
  evidence?: string;
  explanation?: string;
  meaning?: string;
  quickFix?: string;
  quick_fix?: string;
}

interface FixPlanItem {
  rule?: string;
  title?: string;
  howToApply?: string;
  how_to_apply?: string;
  whyItHelps?: string;
  why_it_helps?: string;
}

interface DashboardData {
  latest: {
    id: string;
    title: string | null;
    leakScore: number;
    createdAt: string;
    tradesCount: number;
    isSample: boolean;
    sampleType: string | null;
    topLeaks: LeakItem[];
    keyStats: any;
    fixPlan: FixPlanItem[] | any;
    fullReport: any;
  } | null;
  scoreDelta: number | null;
  trend: "improving" | "stable" | "deteriorating" | null;
  totalReports: number;
  recentReports: ReportSummary[];
}

function getScoreStatus(score: number) {
  if (score >= 65) return { label: "Strong Structure", color: "text-emerald-700 dark:text-emerald-400", bg: "bg-emerald-50 border-emerald-200 dark:bg-emerald-900/30 dark:border-emerald-700", dot: "bg-emerald-500" };
  if (score >= 35) return { label: "Needs Attention", color: "text-amber-700 dark:text-amber-400", bg: "bg-amber-50 border-amber-200 dark:bg-amber-900/30 dark:border-amber-700", dot: "bg-amber-500" };
  return { label: "High Leakage", color: "text-red-700 dark:text-red-400", bg: "bg-red-50 border-red-200 dark:bg-red-900/30 dark:border-red-700", dot: "bg-red-500" };
}

function getScoreColor(score: number) {
  if (score >= 65) return "text-emerald-600 dark:text-emerald-400";
  if (score >= 35) return "text-amber-600 dark:text-amber-400";
  return "text-red-600 dark:text-red-400";
}

function getScoreRingColor(score: number) {
  if (score >= 65) return "stroke-emerald-500";
  if (score >= 35) return "stroke-amber-500";
  return "stroke-red-500";
}

function getInsightSummary(report: DashboardData["latest"]): string | null {
  if (!report) return null;
  const fr = report.fullReport as any;
  if (fr?.summary) return fr.summary;
  if (fr?.insight) return fr.insight;
  const leaks = report.topLeaks || [];
  if (leaks.length > 0) {
    const top = leaks[0];
    const leakName = top.name || top.title || "an area";
    return `Your latest analysis identified ${leaks.length} key area${leaks.length > 1 ? "s" : ""} for improvement. The primary focus is ${leakName.toLowerCase()}, which may be impacting your overall trading structure.`;
  }
  return null;
}

function getFixActions(report: DashboardData["latest"]): string[] {
  if (!report) return [];
  const actions: string[] = [];
  const fp = report.fixPlan;
  if (Array.isArray(fp)) {
    fp.slice(0, 2).forEach((item: any) => {
      const rule = item.rule || item.title || "";
      if (rule) actions.push(rule);
    });
  }
  actions.push("Run another report after your next trading session");
  return actions.slice(0, 3);
}

function getSeverityColor(severity?: any) {
  const s = String(severity || "").toLowerCase();
  if (s === "high" || s === "critical") return "bg-red-100 text-red-700 border-red-200";
  if (s === "medium" || s === "moderate") return "bg-amber-100 text-amber-700 border-amber-200";
  return "bg-blue-100 text-blue-700 border-blue-200";
}

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [saving, setSaving] = useState(false);
  const editInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { router.push("/login"); return; }
    fetch("/api/dashboard")
      .then((r) => {
        if (!r.ok) throw new Error("Failed to load dashboard");
        return r.json();
      })
      .then((d) => {
        setData(d);
        setError(null);
      })
      .catch((err) => {
        console.error("Dashboard load error:", err);
        setError("Unable to load dashboard data. Please try refreshing.");
        setData({ latest: null, scoreDelta: null, trend: null, totalReports: 0, recentReports: [] });
      })
      .finally(() => setLoading(false));
  }, [user, authLoading, router]);

  if (authLoading || !user) return null;

  const freeUsed = user.usage?.freeReportsUsed ?? 0;
  const isPro = user.subscription?.status === "active" || user.subscription?.status === "trialing";

  const startEditing = (report: ReportSummary, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setEditingId(report.id);
    setEditValue(report.title || "Leak Report");
    setTimeout(() => editInputRef.current?.focus(), 50);
  };

  const cancelEditing = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setEditingId(null);
    setEditValue("");
  };

  const saveTitle = async (reportId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const trimmed = editValue.trim();
    if (!trimmed) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/reports/${reportId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: trimmed }),
      });
      if (res.ok && data) {
        setData({
          ...data,
          recentReports: data.recentReports.map((r) =>
            r.id === reportId ? { ...r, title: trimmed } : r
          ),
        });
      }
    } finally {
      setSaving(false);
      setEditingId(null);
      setEditValue("");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 text-brand-accent animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 py-12">
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
          <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-3" />
          <p className="text-sm text-red-700 mb-4">{error}</p>
          <button onClick={() => { setLoading(true); setError(null); fetch("/api/dashboard").then(r => { if (!r.ok) throw new Error("Failed"); return r.json(); }).then(d => { setData(d); setError(null); }).catch(() => setError("Still unable to load. Please try again later.")).finally(() => setLoading(false)); }} className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const latest = data?.latest || null;
  const reports = data?.recentReports || [];
  const insight = getInsightSummary(latest);
  const fixActions = latest ? getFixActions(latest) : [];
  const leaks = (latest?.topLeaks as LeakItem[]) || [];

  const isNewUser = (data?.totalReports ?? 0) === 0 && freeUsed === 0;

  return (
    <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 py-6 space-y-6 animate-fade-in">
      <OnboardingModal isNewUser={isNewUser} />

      {/* HERO CARD */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-6 sm:p-8">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-brand-accent/10 via-transparent to-transparent"></div>
        <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-lg sm:text-xl font-semibold text-white/90">
                {user.name ? `${user.name}'s` : "Your"} Trading Performance
              </h1>
            </div>
            <div className="flex flex-wrap items-center gap-2 mt-3 mb-4">
              {latest ? (
                <>
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${getScoreStatus(latest.leakScore).bg} ${getScoreStatus(latest.leakScore).color}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${getScoreStatus(latest.leakScore).dot}`}></span>
                    {getScoreStatus(latest.leakScore).label}
                  </span>
                  {data && data.totalReports >= 2 ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-white/10 text-white/80 border border-white/10">
                      <Activity className="h-3 w-3" /> Trend Tracking Active
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-white/10 text-white/80 border border-white/10">
                      <Target className="h-3 w-3" /> Baseline Established
                    </span>
                  )}
                </>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-white/10 text-white/80 border border-white/10">
                  <Target className="h-3 w-3" /> Ready to Analyze
                </span>
              )}
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/upload" className="inline-flex items-center gap-2 bg-brand-accent hover:bg-brand-accent/90 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-all hover:shadow-lg hover:shadow-brand-accent/25">
                <Upload className="h-4 w-4" />
                New Leak Report
              </Link>
              {latest && (
                <Link href={`/reports/${latest.id}`} className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors border border-white/10">
                  View Latest Breakdown
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
              )}
            </div>
          </div>

          {latest ? (
            <div className="flex flex-col items-center shrink-0">
              <div className="relative w-28 h-28 sm:w-32 sm:h-32">
                <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
                  <circle cx="60" cy="60" r="52" fill="none" stroke="currentColor" strokeWidth="8" className="text-white/10" />
                  <circle cx="60" cy="60" r="52" fill="none" strokeWidth="8"
                    className={getScoreRingColor(latest.leakScore)}
                    strokeDasharray={`${(latest.leakScore / 100) * 327} 327`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl sm:text-4xl font-bold">{latest.leakScore}</span>
                  <span className="text-[10px] uppercase tracking-wider text-white/50 font-medium">Leak Score</span>
                </div>
              </div>
              {data?.scoreDelta !== null && data?.scoreDelta !== undefined && (
                <div className={`flex items-center gap-1 mt-2 text-xs font-medium ${
                  data.scoreDelta > 0 ? "text-emerald-400" : data.scoreDelta < 0 ? "text-red-400" : "text-white/50"
                }`}>
                  {data.scoreDelta > 0 ? <TrendingUp className="h-3 w-3" /> : data.scoreDelta < 0 ? <TrendingDown className="h-3 w-3" /> : <Minus className="h-3 w-3" />}
                  {data.scoreDelta > 0 ? "+" : ""}{data.scoreDelta} pts vs last
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center shrink-0 opacity-40">
              <div className="relative w-28 h-28 sm:w-32 sm:h-32">
                <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
                  <circle cx="60" cy="60" r="52" fill="none" stroke="currentColor" strokeWidth="8" className="text-white/10" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl sm:text-4xl font-bold">--</span>
                  <span className="text-[10px] uppercase tracking-wider text-white/50 font-medium">Leak Score</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* PLAN STATUS */}
      {!isPro ? (
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-950">
              <Zap className="h-4 w-4 text-brand-accent" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-900 dark:text-slate-100">Free Plan: {freeUsed} of 3 reports used ({Math.max(3 - freeUsed, 0)} remaining)</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Sample reports don't count toward your limit</p>
            </div>
          </div>
          <Link href="/pricing" className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-accent hover:text-brand-accent/80 transition-colors shrink-0">
            Upgrade to Pro for unlimited
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      ) : (
        <div className="rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/30 p-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900">
              <Shield className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-emerald-900 dark:text-emerald-300">Pro Active</p>
              {user.subscription?.currentPeriodEnd && (
                <p className="text-xs text-emerald-700">
                  Renews {new Date(user.subscription.currentPeriodEnd).toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" })}
                </p>
              )}
            </div>
          </div>
          <Link href="/settings" className="text-xs font-medium text-emerald-700 hover:text-emerald-900 transition-colors">
            Manage Billing
          </Link>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* AI INSIGHT CARD */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5 sm:p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-50 dark:bg-violet-950">
              <Lightbulb className="h-4 w-4 text-violet-600 dark:text-violet-400" />
            </div>
            <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">AI Insight (Latest Report)</h2>
          </div>
          {insight ? (
            <>
              <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed mb-4">{insight}</p>
              <Link href={`/reports/${latest!.id}`} className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-accent hover:text-brand-accent/80 transition-colors">
                See Trades Driving This
                <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </>
          ) : (
            <div className="text-center py-4">
              <p className="text-sm text-slate-500">Generate a report to see your AI insight summary.</p>
              <Link href="/upload" className="inline-flex items-center gap-1.5 mt-3 text-xs font-semibold text-brand-accent hover:text-brand-accent/80">
                Create Your First Report <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          )}
          <p className="text-[10px] text-slate-400 mt-4">Informational only. Not financial advice. No guarantees.</p>
        </div>

        {/* PROGRESS TRACKING CARD */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-950">
                <BarChart3 className="h-4 w-4 text-brand-accent" />
              </div>
              <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Progress Tracking</h2>
            </div>
            {data && data.trend && (
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                data.trend === "improving" ? "bg-emerald-50 text-emerald-700" :
                data.trend === "deteriorating" ? "bg-red-50 text-red-700" :
                "bg-slate-100 text-slate-600"
              }`}>
                {data.trend === "improving" ? <TrendingUp className="h-3 w-3" /> : data.trend === "deteriorating" ? <TrendingDown className="h-3 w-3" /> : <Minus className="h-3 w-3" />}
                {data.trend}
              </span>
            )}
          </div>
          {data && data.totalReports >= 2 ? (
            <div>
              <div className="space-y-2 mb-4">
                {reports.slice(0, 4).map((r, i) => (
                  <div key={r.id} className="flex items-center gap-3">
                    <span className="text-[10px] text-slate-400 w-16 shrink-0">{new Date(r.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}</span>
                    <div className="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div className={`h-full rounded-full transition-all ${r.leakScore >= 65 ? "bg-emerald-500" : r.leakScore >= 35 ? "bg-amber-500" : "bg-red-500"}`} style={{ width: `${r.leakScore}%` }}></div>
                    </div>
                    <span className={`text-xs font-bold w-8 text-right ${getScoreColor(r.leakScore)}`}>{r.leakScore}</span>
                  </div>
                ))}
              </div>
              <Link href="/progress" className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-accent hover:text-brand-accent/80 transition-colors">
                View Full Progress Chart
                <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          ) : (
            <div className="text-center py-6">
              <div className="flex justify-center gap-1 mb-4">
                {[40, 55, 48, 62, 70].map((h, i) => (
                  <div key={i} className="w-6 rounded-t bg-slate-100" style={{ height: `${h}px` }}></div>
                ))}
              </div>
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                {data && data.totalReports === 1
                  ? "Generate one more report to unlock trend analysis."
                  : "Generate your first report to set a baseline."
                }
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                {data && data.totalReports === 1
                  ? "Your first report sets a baseline. Run another after your next trades to see progress."
                  : "Upload your trade history and our AI will analyze your patterns."
                }
              </p>
              <Link href="/upload" className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-accent hover:text-brand-accent/80">
                {data && data.totalReports === 1 ? "Run Your Next Report" : "Create Your First Report"}
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          )}
        </div>

        {/* TOP 3 LEAKS CARD */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5 sm:p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 dark:bg-red-950">
              <AlertCircle className="h-4 w-4 text-red-500 dark:text-red-400" />
            </div>
            <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Top Leaks (Latest Report)</h2>
          </div>
          {leaks.length > 0 ? (
            <div className="space-y-3">
              {leaks.slice(0, 3).map((leak, i) => (
                <Link key={i} href={`/reports/${latest!.id}`} className="block group">
                  <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors -mx-1">
                    <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase border shrink-0 mt-0.5 ${getSeverityColor(leak.severity)}`}>
                      {typeof leak.severity === "string" ? leak.severity : "Info"}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 dark:text-slate-100 group-hover:text-brand-accent transition-colors">{leak.name || leak.title || `Leak ${i + 1}`}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">{leak.meaning || leak.explanation || leak.evidence || ""}</p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-brand-accent transition-colors shrink-0 mt-0.5" />
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-sm text-slate-500">No leaks yet — generate your first report.</p>
            </div>
          )}
        </div>

        {/* NEXT ACTIONS CARD */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5 sm:p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 dark:bg-emerald-950">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Next Actions</h2>
          </div>
          {latest ? (
            <div className="space-y-3">
              {fixActions.map((action, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-accent/10 text-brand-accent shrink-0 mt-0.5">
                    <span className="text-xs font-bold">{i + 1}</span>
                  </div>
                  <p className="text-sm text-slate-700 dark:text-slate-300">{action}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {[
                { label: "Upload your trade history", done: false },
                { label: "Confirm extracted trade details", done: false },
                { label: "Get your Leak Report", done: false },
              ].map((step, i) => (
                <div key={i} className="flex items-start gap-3">
                  <Circle className="h-5 w-5 text-slate-300 shrink-0 mt-0.5" />
                  <p className="text-sm text-slate-600">{step.label}</p>
                </div>
              ))}
              <Link href="/upload" className="inline-flex items-center gap-1.5 mt-2 text-xs font-semibold text-brand-accent hover:text-brand-accent/80">
                Get Started <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* RECENT REPORTS */}
      {reports.length > 0 && (
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Recent Reports</h2>
            {reports.length > 5 && (
              <Link href="/reports" className="text-xs font-medium text-brand-accent hover:text-brand-accent/80 transition-colors">
                View all
              </Link>
            )}
          </div>
          <div className="space-y-2">
            {reports.slice(0, 5).map((report) => (
              <div key={report.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors group -mx-1">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className={`flex h-9 w-9 items-center justify-center rounded-lg text-xs font-bold text-white shrink-0 ${
                    report.leakScore >= 65 ? "bg-emerald-500" : report.leakScore >= 35 ? "bg-amber-500" : "bg-red-500"
                  }`}>
                    {report.leakScore}
                  </div>
                  <div className="flex-1 min-w-0">
                    {editingId === report.id ? (
                      <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                        <input
                          ref={editInputRef}
                          type="text"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") saveTitle(report.id, e as any);
                            if (e.key === "Escape") { setEditingId(null); setEditValue(""); }
                          }}
                          maxLength={100}
                          className="input py-1 text-sm font-medium w-full max-w-xs"
                          disabled={saving}
                        />
                        <button onClick={(e) => saveTitle(report.id, e)} disabled={saving || !editValue.trim()} className="p-1 rounded hover:bg-green-100 text-green-600 disabled:opacity-50"><Check className="h-3.5 w-3.5" /></button>
                        <button onClick={cancelEditing} disabled={saving} className="p-1 rounded hover:bg-red-100 text-red-500"><X className="h-3.5 w-3.5" /></button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Link href={`/reports/${report.id}`} className="block min-w-0">
                          <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate hover:text-brand-accent transition-colors">{report.title || "Leak Report"}</p>
                        </Link>
                        <button onClick={(e) => startEditing(report, e)} className="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-all shrink-0" title="Rename">
                          <Pencil className="h-3 w-3" />
                        </button>
                      </div>
                    )}
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      {new Date(report.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })} · {report.tradesCount} trades
                      {report.isSample && <span className="ml-1.5 text-violet-500 dark:text-violet-400 font-medium">Sample</span>}
                    </p>
                  </div>
                </div>
                <Link href={`/reports/${report.id}`} className="shrink-0 ml-2">
                  <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-brand-accent transition-colors" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
