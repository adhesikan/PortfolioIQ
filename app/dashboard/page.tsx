"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { FileText, Upload, ArrowRight, TrendingUp, AlertCircle, Loader2, BarChart3, Pencil, Check, X } from "lucide-react";
import Link from "next/link";
import Tooltip from "@/components/Tooltip";

interface ReportSummary {
  id: string;
  title: string | null;
  leakScore: number;
  createdAt: string;
  tradesCount: number;
  isSample: boolean;
  sampleType: string | null;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [reports, setReports] = useState<ReportSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { router.push("/login"); return; }
    fetch("/api/reports")
      .then((r) => r.json())
      .then((data) => setReports(data.reports || []))
      .finally(() => setLoading(false));
  }, [user, router]);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [saving, setSaving] = useState(false);
  const editInputRef = useRef<HTMLInputElement>(null);

  if (!user) return null;

  const freeUsed = user.usage?.freeReportsUsed ?? 0;
  const isPro = user.subscription?.status === "active";
  const latestReport = reports[0];

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
      if (res.ok) {
        setReports((prev) => prev.map((r) => r.id === reportId ? { ...r, title: trimmed } : r));
      }
    } finally {
      setSaving(false);
      setEditingId(null);
      setEditValue("");
    }
  };

  return (
    <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 py-8 animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Welcome{user.name ? `, ${user.name}` : ""}
          </h1>
          <p className="text-sm text-slate-600 mt-1">Your trading performance dashboard</p>
        </div>
        <Link href="/upload" className="btn-primary">
          <Upload className="h-4 w-4" />
          New Leak Report
        </Link>
      </div>

      {!isPro && (
        <div className="card mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-100">
          <div className="flex items-center justify-between">
            <div>
              <Tooltip content="You get 3 free Leak Reports for life. Each successful report generation counts as one use.">
                <p className="text-sm font-medium text-blue-900">Free Reports</p>
              </Tooltip>
              <p className="text-xs text-blue-700 mt-0.5">{freeUsed} of 3 free reports used</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-40 h-3 rounded-full bg-blue-200 overflow-hidden">
                <div className="h-full bg-brand-accent rounded-full transition-all" style={{ width: `${Math.min((freeUsed / 3) * 100, 100)}%` }}></div>
              </div>
              <span className="text-sm font-bold text-blue-900">{Math.max(3 - freeUsed, 0)} left</span>
            </div>
          </div>
          {freeUsed >= 3 ? (
            <div className="mt-3 pt-3 border-t border-blue-200">
              <Link href="/pricing" className="text-sm text-red-600 font-medium hover:underline flex items-center gap-1">
                You&apos;ve used all 3 free reports. Upgrade to continue <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          ) : freeUsed >= 2 ? (
            <div className="mt-3 pt-3 border-t border-blue-200">
              <Link href="/pricing" className="text-sm text-brand-accent font-medium hover:underline flex items-center gap-1">
                Upgrade to Pro for unlimited reports <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          ) : null}
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-3 mb-8">
        <div className="card">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100">
              <FileText className="h-5 w-5 text-brand-accent" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{reports.length}</p>
              <Tooltip content="The total number of Leak Reports you've generated so far.">
                <p className="text-xs text-slate-500">Total Reports</p>
              </Tooltip>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-100">
              <TrendingUp className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className={`text-2xl font-bold ${latestReport ? (latestReport.leakScore >= 70 ? "text-green-600" : latestReport.leakScore >= 40 ? "text-yellow-600" : "text-red-600") : "text-slate-400"}`}>
                {latestReport ? latestReport.leakScore : "—"}
              </p>
              <Tooltip content="Your most recent Leak Score (0-100). Higher is better — 70+ means few leaks, below 40 means significant issues to fix.">
                <p className="text-xs text-slate-500">Latest Leak Score</p>
              </Tooltip>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100">
              <BarChart3 className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">
                {reports.reduce((sum, r) => sum + r.tradesCount, 0)}
              </p>
              <Tooltip content="The total number of individual trades our AI has analyzed across all your reports.">
                <p className="text-xs text-slate-500">Trades Analyzed</p>
              </Tooltip>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="card text-center py-12">
          <Loader2 className="h-8 w-8 text-brand-accent mx-auto animate-spin" />
        </div>
      ) : reports.length === 0 ? (
        <div className="card text-center py-12">
          <Upload className="h-12 w-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-900 mb-2">Get started with your first Leak Report</h3>
          <p className="text-sm text-slate-600 mb-6 max-w-md mx-auto">
            Upload a screenshot or CSV of your trade history. Our AI will analyze your patterns and find what&apos;s holding you back.
          </p>
          <Link href="/upload" className="btn-primary px-8 py-3">
            Upload Your Trades
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      ) : (
        <div>
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Recent Reports</h2>
          <div className="space-y-3">
            {reports.slice(0, 5).map((report) => (
              <div key={report.id} className="card-hover flex items-center justify-between group">
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <Link href={`/reports/${report.id}`} className="shrink-0">
                    <div className={`flex h-11 w-11 items-center justify-center rounded-xl text-sm font-bold text-white ${
                      report.leakScore >= 70 ? "bg-green-500" : report.leakScore >= 40 ? "bg-yellow-500" : "bg-red-500"
                    }`}>
                      {report.leakScore}
                    </div>
                  </Link>
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
                        <button
                          onClick={(e) => saveTitle(report.id, e)}
                          disabled={saving || !editValue.trim()}
                          className="p-1 rounded hover:bg-green-100 text-green-600 disabled:opacity-50"
                        >
                          <Check className="h-4 w-4" />
                        </button>
                        <button
                          onClick={cancelEditing}
                          disabled={saving}
                          className="p-1 rounded hover:bg-red-100 text-red-500"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Link href={`/reports/${report.id}`} className="block min-w-0">
                          <p className="font-medium text-slate-900 truncate">{report.title || "Leak Report"}</p>
                        </Link>
                        <button
                          onClick={(e) => startEditing(report, e)}
                          className="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-opacity shrink-0"
                          title="Rename report"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    )}
                    <p className="text-xs text-slate-500">{new Date(report.createdAt).toLocaleDateString()} · {report.tradesCount} trades</p>
                  </div>
                </div>
                <Link href={`/reports/${report.id}`} className="shrink-0 ml-2">
                  <ArrowRight className="h-5 w-5 text-slate-400 group-hover:text-brand-accent transition-colors" />
                </Link>
              </div>
            ))}
          </div>
          {reports.length > 5 && (
            <div className="text-center mt-4">
              <Link href="/reports" className="text-sm text-brand-accent font-medium hover:underline">View all reports</Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
