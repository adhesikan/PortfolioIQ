"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { FileText, Calendar, ArrowRight, Loader2, Beaker, Pencil, Check, X } from "lucide-react";
import Link from "next/link";

interface ReportSummary {
  id: string;
  title?: string | null;
  leakScore: number;
  createdAt: string;
  tradesCount: number;
  isSample?: boolean;
  sampleType?: string | null;
}

const SAMPLE_LABELS: Record<string, string> = {
  DAY_TRADER: "Day Trader",
  SWING_TRADER: "Swing Trader",
  MESSY: "Messy Trader",
  DISCIPLINED: "Disciplined Trader",
  OPTIONS: "Options Trader",
};

export default function ReportsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [reports, setReports] = useState<ReportSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [saving, setSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!user) { router.push("/login"); return; }
    fetch("/api/reports")
      .then((r) => r.json())
      .then((data) => setReports(data.reports || []))
      .finally(() => setLoading(false));
  }, [user, router]);

  useEffect(() => {
    if (editingId && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editingId]);

  const startEditing = (e: React.MouseEvent, report: ReportSummary) => {
    e.preventDefault();
    e.stopPropagation();
    setEditingId(report.id);
    setEditValue(report.title || getDefaultTitle(report));
  };

  const cancelEditing = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setEditingId(null);
    setEditValue("");
  };

  const saveTitle = async (e: React.MouseEvent, reportId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setSaving(true);
    try {
      const res = await fetch(`/api/reports/${reportId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: editValue }),
      });
      if (res.ok) {
        const data = await res.json();
        setReports((prev) =>
          prev.map((r) => (r.id === reportId ? { ...r, title: data.title } : r))
        );
      }
    } catch {}
    setSaving(false);
    setEditingId(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent, reportId: string) => {
    if (e.key === "Enter") {
      e.preventDefault();
      saveTitle(e as any, reportId);
    } else if (e.key === "Escape") {
      setEditingId(null);
    }
  };

  const getDefaultTitle = (report: ReportSummary) => {
    if (report.isSample) return "Leak Report (Example)";
    return "Leak Report";
  };

  if (!user) return null;

  return (
    <div className="mx-auto w-full max-w-5xl px-4 sm:px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Your Leak Reports</h1>
          <p className="text-sm text-slate-600 mt-1">Review past reports and track your progress</p>
        </div>
        <Link href="/upload" className="btn-primary">New Report</Link>
      </div>

      {loading ? (
        <div className="card text-center py-16">
          <Loader2 className="h-8 w-8 text-brand-accent mx-auto animate-spin" />
        </div>
      ) : reports.length === 0 ? (
        <div className="card text-center py-16">
          <FileText className="h-12 w-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-900 mb-2">No reports yet</h3>
          <p className="text-sm text-slate-600 mb-6">Upload your trade history to generate your first Leak Report</p>
          <Link href="/upload" className="btn-primary">Upload Trades</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {reports.map((report) => (
            <Link key={report.id} href={`/reports/${report.id}`} className="card-hover flex items-center justify-between group block">
              <div className="flex items-center gap-4">
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl text-lg font-bold text-white ${
                  report.leakScore >= 70 ? "bg-green-500" : report.leakScore >= 40 ? "bg-yellow-500" : "bg-red-500"
                }`}>
                  {report.leakScore}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    {editingId === report.id ? (
                      <div className="flex items-center gap-1.5" onClick={(e) => e.preventDefault()}>
                        <input
                          ref={inputRef}
                          type="text"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onKeyDown={(e) => handleKeyDown(e, report.id)}
                          onClick={(e) => e.stopPropagation()}
                          maxLength={100}
                          className="px-2 py-0.5 text-sm font-semibold text-slate-900 border border-brand-accent rounded-md outline-none focus:ring-2 focus:ring-brand-accent/30 w-56"
                        />
                        <button
                          onClick={(e) => saveTitle(e, report.id)}
                          disabled={saving}
                          className="p-1 rounded hover:bg-green-100 text-green-600 transition-colors"
                        >
                          <Check className="h-4 w-4" />
                        </button>
                        <button
                          onClick={cancelEditing}
                          className="p-1 rounded hover:bg-red-100 text-red-500 transition-colors"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <p className="font-semibold text-slate-900">
                          {report.title || getDefaultTitle(report)}
                        </p>
                        <button
                          onClick={(e) => startEditing(e, report)}
                          className="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-all"
                          title="Rename report"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                      </>
                    )}
                    {report.isSample && editingId !== report.id && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-medium text-amber-800">
                        <Beaker className="h-2.5 w-2.5" />
                        {report.sampleType ? SAMPLE_LABELS[report.sampleType] || "Sample" : "Sample"}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(report.createdAt).toLocaleDateString()}
                    </span>
                    <span>{report.tradesCount} trades analyzed</span>
                  </div>
                </div>
              </div>
              <ArrowRight className="h-5 w-5 text-slate-400 group-hover:text-brand-accent transition-colors" />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
