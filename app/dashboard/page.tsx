"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { FileText, Upload, ArrowRight, TrendingUp, AlertCircle, Loader2, BarChart3 } from "lucide-react";
import Link from "next/link";

interface ReportSummary {
  id: string;
  leakScore: number;
  createdAt: string;
  tradesCount: number;
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

  if (!user) return null;

  const freeUsed = user.usage?.freeReportsUsed ?? 0;
  const isPro = user.subscription?.status === "active";
  const latestReport = reports[0];

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
              <p className="text-sm font-medium text-blue-900">Free Reports</p>
              <p className="text-xs text-blue-700 mt-0.5">{freeUsed} of 10 used</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-40 h-3 rounded-full bg-blue-200 overflow-hidden">
                <div className="h-full bg-brand-accent rounded-full transition-all" style={{ width: `${(freeUsed / 10) * 100}%` }}></div>
              </div>
              <span className="text-sm font-bold text-blue-900">{10 - freeUsed} left</span>
            </div>
          </div>
          {freeUsed >= 8 && (
            <div className="mt-3 pt-3 border-t border-blue-200">
              <Link href="/pricing" className="text-sm text-brand-accent font-medium hover:underline flex items-center gap-1">
                Upgrade to Pro for unlimited reports <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          )}
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
              <p className="text-xs text-slate-500">Total Reports</p>
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
              <p className="text-xs text-slate-500">Latest Leak Score</p>
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
              <p className="text-xs text-slate-500">Trades Analyzed</p>
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
              <Link key={report.id} href={`/reports/${report.id}`} className="card-hover flex items-center justify-between group block">
                <div className="flex items-center gap-4">
                  <div className={`flex h-11 w-11 items-center justify-center rounded-xl text-sm font-bold text-white ${
                    report.leakScore >= 70 ? "bg-green-500" : report.leakScore >= 40 ? "bg-yellow-500" : "bg-red-500"
                  }`}>
                    {report.leakScore}
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">Leak Report</p>
                    <p className="text-xs text-slate-500">{new Date(report.createdAt).toLocaleDateString()} · {report.tradesCount} trades</p>
                  </div>
                </div>
                <ArrowRight className="h-5 w-5 text-slate-400 group-hover:text-brand-accent transition-colors" />
              </Link>
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
