"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef, useCallback } from "react";
import {
  FileText, Calendar, ArrowRight, Loader2, Beaker, Pencil, Check, X,
  Search, ChevronLeft, ChevronRight, ArrowUpDown, ArrowUp, ArrowDown,
  Filter, SlidersHorizontal
} from "lucide-react";
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

interface Pagination {
  page: number;
  perPage: number;
  total: number;
  totalPages: number;
}

const SAMPLE_LABELS: Record<string, string> = {
  DAY_TRADER: "Day Trader",
  SWING_TRADER: "Swing Trader",
  MESSY: "Messy Trader",
  DISCIPLINED: "Disciplined Trader",
  OPTIONS: "Options Trader",
};

const PER_PAGE_OPTIONS = [5, 10, 15, 25, 50];
const STORAGE_KEY = "portfolioiq_reports_perPage";

type SortField = "createdAt" | "leakScore" | "title";
type SortOrder = "asc" | "desc";
type FilterType = "all" | "uploaded" | "sample";

export default function ReportsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [reports, setReports] = useState<ReportSummary[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, perPage: 10, total: 0, totalPages: 0 });
  const [loading, setLoading] = useState(true);

  const [sortBy, setSortBy] = useState<SortField>("createdAt");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [filterType, setFilterType] = useState<FilterType>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [perPageLoaded, setPerPageLoaded] = useState(false);

  useEffect(() => {
    if (!perPageLoaded) {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const n = parseInt(saved);
        if (PER_PAGE_OPTIONS.includes(n)) setPerPage(n);
      }
      setPerPageLoaded(true);
    }
  }, [perPageLoaded]);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [saving, setSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, filterType, sortBy, sortOrder, perPage]);

  const fetchReports = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        perPage: perPage.toString(),
        sortBy,
        sortOrder,
        type: filterType,
      });
      if (debouncedSearch) params.set("search", debouncedSearch);

      const res = await fetch(`/api/reports?${params}`);
      if (res.ok) {
        const data = await res.json();
        setReports(data.reports || []);
        setPagination(data.pagination || { page: 1, perPage: 10, total: 0, totalPages: 0 });
      }
    } catch {}
    setLoading(false);
  }, [user, page, perPage, sortBy, sortOrder, filterType, debouncedSearch]);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { router.push("/login"); return; }
    fetchReports();
  }, [user, authLoading, router, fetchReports]);

  useEffect(() => {
    if (editingId && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editingId]);

  const handlePerPageChange = (value: number) => {
    setPerPage(value);
    localStorage.setItem(STORAGE_KEY, value.toString());
  };

  const handleSort = (field: SortField) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder(field === "leakScore" ? "asc" : "desc");
    }
  };

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

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortBy !== field) return <ArrowUpDown className="h-3.5 w-3.5 text-slate-400" />;
    return sortOrder === "asc"
      ? <ArrowUp className="h-3.5 w-3.5 text-brand-accent" />
      : <ArrowDown className="h-3.5 w-3.5 text-brand-accent" />;
  };

  if (!user) return null;

  const hasFiltersActive = filterType !== "all" || debouncedSearch !== "";

  return (
    <div className="mx-auto w-full max-w-5xl px-4 sm:px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Your Leak Reports</h1>
          <p className="text-sm text-slate-600 mt-1">
            {pagination.total} report{pagination.total !== 1 ? "s" : ""} total
          </p>
        </div>
        <Link href="/upload" className="btn-primary">New Report</Link>
      </div>

      <div className="card mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search reports by title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-accent/30 focus:border-brand-accent"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 text-xs text-slate-500">
              <Filter className="h-3.5 w-3.5" />
              <span>Type:</span>
            </div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as FilterType)}
              className="text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-accent/30 focus:border-brand-accent bg-white"
            >
              <option value="all">All Reports</option>
              <option value="uploaded">My Uploads</option>
              <option value="sample">Samples</option>
            </select>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-slate-100">
          <div className="flex items-center gap-1 text-xs text-slate-500 mr-1">
            <SlidersHorizontal className="h-3.5 w-3.5" />
            <span>Sort by:</span>
          </div>
          {([
            { field: "createdAt" as SortField, label: "Date" },
            { field: "leakScore" as SortField, label: "Score" },
            { field: "title" as SortField, label: "Title" },
          ]).map(({ field, label }) => (
            <button
              key={field}
              onClick={() => handleSort(field)}
              className={`inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg border transition-colors ${
                sortBy === field
                  ? "border-brand-accent bg-blue-50 text-brand-accent font-medium"
                  : "border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50"
              }`}
            >
              {label}
              <SortIcon field={field} />
            </button>
          ))}

          <div className="ml-auto flex items-center gap-2">
            <span className="text-xs text-slate-500">Per page:</span>
            <select
              value={perPage}
              onChange={(e) => handlePerPageChange(parseInt(e.target.value))}
              className="text-xs border border-slate-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-brand-accent/30 bg-white"
            >
              {PER_PAGE_OPTIONS.map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="card text-center py-16">
          <Loader2 className="h-8 w-8 text-brand-accent mx-auto animate-spin" />
        </div>
      ) : reports.length === 0 ? (
        <div className="card text-center py-16">
          <FileText className="h-12 w-12 text-slate-300 mx-auto mb-4" />
          {hasFiltersActive ? (
            <>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">No matching reports</h3>
              <p className="text-sm text-slate-600 mb-6">Try adjusting your search or filters</p>
              <button
                onClick={() => { setSearchQuery(""); setFilterType("all"); }}
                className="btn-ghost text-sm text-brand-accent"
              >
                Clear filters
              </button>
            </>
          ) : (
            <>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">No reports yet</h3>
              <p className="text-sm text-slate-600 mb-6">Upload your trade history to generate your first Leak Report</p>
              <Link href="/upload" className="btn-primary">Upload Trades</Link>
            </>
          )}
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {reports.map((report) => (
              <Link
                key={report.id}
                href={`/reports/${report.id}`}
                className="card-hover flex items-center justify-between group block"
              >
                <div className="flex items-center gap-4">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-xl text-lg font-bold text-white shrink-0 ${
                    report.leakScore >= 70 ? "bg-green-500" : report.leakScore >= 40 ? "bg-yellow-500" : "bg-red-500"
                  }`}>
                    {report.leakScore}
                  </div>
                  <div className="min-w-0">
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
                          <p className="font-semibold text-slate-900 truncate">
                            {report.title || getDefaultTitle(report)}
                          </p>
                          <button
                            onClick={(e) => startEditing(e, report)}
                            className="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-all shrink-0"
                            title="Rename report"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                        </>
                      )}
                      {report.isSample && editingId !== report.id && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-medium text-amber-800 shrink-0">
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
                      <span>{report.tradesCount} trades</span>
                      <span className={`font-medium ${
                        report.leakScore >= 70 ? "text-green-600" : report.leakScore >= 40 ? "text-yellow-600" : "text-red-600"
                      }`}>
                        Score: {report.leakScore}
                      </span>
                    </div>
                  </div>
                </div>
                <ArrowRight className="h-5 w-5 text-slate-400 group-hover:text-brand-accent transition-colors shrink-0" />
              </Link>
            ))}
          </div>

          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-100">
              <p className="text-xs text-slate-500">
                Showing {((page - 1) * perPage) + 1}–{Math.min(page * perPage, pagination.total)} of {pagination.total}
              </p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage(1)}
                  disabled={page === 1}
                  className="px-2 py-1.5 text-xs rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  First
                </button>
                <button
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                  className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                {generatePageNumbers(page, pagination.totalPages).map((p, i) =>
                  p === "..." ? (
                    <span key={`ellipsis-${i}`} className="px-2 text-xs text-slate-400">...</span>
                  ) : (
                    <button
                      key={p}
                      onClick={() => setPage(p as number)}
                      className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${
                        page === p
                          ? "bg-brand-accent text-white border-brand-accent"
                          : "border-slate-200 hover:bg-slate-50 text-slate-700"
                      }`}
                    >
                      {p}
                    </button>
                  )
                )}
                <button
                  onClick={() => setPage(page + 1)}
                  disabled={page === pagination.totalPages}
                  className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setPage(pagination.totalPages)}
                  disabled={page === pagination.totalPages}
                  className="px-2 py-1.5 text-xs rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Last
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function generatePageNumbers(current: number, total: number): (number | "...")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages: (number | "...")[] = [];
  if (current <= 4) {
    for (let i = 1; i <= 5; i++) pages.push(i);
    pages.push("...", total);
  } else if (current >= total - 3) {
    pages.push(1, "...");
    for (let i = total - 4; i <= total; i++) pages.push(i);
  } else {
    pages.push(1, "...", current - 1, current, current + 1, "...", total);
  }
  return pages;
}
