"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useState, useRef, useCallback } from "react";
import { Upload, FileText, Image, AlertCircle, Loader2, Check, Edit3, Trash2, ArrowRight } from "lucide-react";

interface ExtractedTrade {
  ticker: string;
  action: string;
  quantity: number;
  entryPrice: number | null;
  exitPrice: number | null;
  entryDate: string | null;
  exitDate: string | null;
  pnl: number | null;
  pnlPercent: number | null;
  holdingDays: number | null;
  confidence: number | null;
}

type Step = "upload" | "confirm" | "generating" | "done";

export default function UploadPage() {
  const { user, refresh } = useAuth();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const csvInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState<Step>("upload");
  const [trades, setTrades] = useState<ExtractedTrade[]>([]);
  const [uploadId, setUploadId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [reportId, setReportId] = useState<string | null>(null);

  if (!user) {
    router.push("/login");
    return null;
  }

  const freeUsed = user.usage?.freeReportsUsed ?? 0;
  const isPro = user.subscription?.status === "active";
  const atLimit = !isPro && freeUsed >= 10;

  const handleScreenshot = async (file: File) => {
    setError("");
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/extract-trades", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Extraction failed");
      setTrades(data.trades);
      setUploadId(data.uploadId);
      setStep("confirm");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCSV = async (file: File) => {
    setError("");
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", "csv");
      const res = await fetch("/api/extract-trades", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "CSV parsing failed");
      setTrades(data.trades);
      setUploadId(data.uploadId);
      setStep("confirm");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateReport = async () => {
    if (!uploadId) return;
    setStep("generating");
    setError("");
    try {
      const res = await fetch("/api/generate-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uploadId, trades }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Report generation failed");
      setReportId(data.reportId);
      await refresh();
      setStep("done");
    } catch (err: any) {
      setError(err.message);
      setStep("confirm");
    }
  };

  const updateTrade = (index: number, field: string, value: any) => {
    setTrades((prev) => prev.map((t, i) => (i === index ? { ...t, [field]: value } : t)));
  };

  const removeTrade = (index: number) => {
    setTrades((prev) => prev.filter((_, i) => i !== index));
  };

  if (atLimit) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 sm:px-6 py-12">
        <div className="card text-center py-12">
          <AlertCircle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Free Report Limit Reached</h2>
          <p className="text-slate-600 mb-6">You&apos;ve used all 10 free reports. Upgrade to Pro for unlimited access.</p>
          <a href="/pricing" className="btn-primary px-8 py-3">Upgrade to Pro</a>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-5xl px-4 sm:px-6 py-8">
      <div className="flex items-center gap-2 mb-8">
        {["Upload", "Confirm", "Report"].map((label, i) => (
          <div key={label} className="flex items-center gap-2">
            <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${
              i === 0 && step === "upload" || i === 1 && step === "confirm" || i === 2 && (step === "generating" || step === "done")
                ? "bg-brand-accent text-white"
                : i < (step === "upload" ? 0 : step === "confirm" ? 1 : 2)
                ? "bg-green-500 text-white"
                : "bg-slate-200 text-slate-500"
            }`}>
              {i < (step === "upload" ? 0 : step === "confirm" ? 1 : 2) ? <Check className="h-4 w-4" /> : i + 1}
            </div>
            <span className="text-sm font-medium text-slate-700 hidden sm:block">{label}</span>
            {i < 2 && <div className="w-8 md:w-16 h-px bg-slate-300"></div>}
          </div>
        ))}
      </div>

      {!isPro && (
        <div className="mb-6 p-3 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-between">
          <span className="text-sm text-blue-800">Free reports used: {freeUsed} / 10</span>
          <div className="w-32 h-2 rounded-full bg-blue-200 overflow-hidden">
            <div className="h-full bg-brand-accent rounded-full" style={{ width: `${(freeUsed / 10) * 100}%` }}></div>
          </div>
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700 flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {step === "upload" && (
        <div className="grid gap-6 md:grid-cols-2">
          <div
            className="card-hover cursor-pointer text-center py-12"
            onClick={() => fileInputRef.current?.click()}
          >
            <Image className="h-12 w-12 text-brand-accent mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Upload Screenshot</h3>
            <p className="text-sm text-slate-600 mb-4">Take a screenshot of your brokerage trade history</p>
            <span className="text-xs text-slate-500">PNG, JPG up to 10MB</span>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleScreenshot(e.target.files[0])}
            />
          </div>
          <div
            className="card-hover cursor-pointer text-center py-12"
            onClick={() => csvInputRef.current?.click()}
          >
            <FileText className="h-12 w-12 text-green-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Upload CSV</h3>
            <p className="text-sm text-slate-600 mb-4">Export your trade history as CSV for more accuracy</p>
            <span className="text-xs text-slate-500">CSV files up to 5MB</span>
            <input
              ref={csvInputRef}
              type="file"
              accept=".csv"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleCSV(e.target.files[0])}
            />
          </div>
        </div>
      )}

      {loading && (
        <div className="card text-center py-16">
          <Loader2 className="h-10 w-10 text-brand-accent mx-auto mb-4 animate-spin" />
          <h3 className="text-lg font-semibold text-slate-900 mb-2">Extracting trades...</h3>
          <p className="text-sm text-slate-600">Our AI is reading your trade data. This may take a moment.</p>
        </div>
      )}

      {step === "confirm" && !loading && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-slate-900">Confirm Extracted Trades ({trades.length})</h2>
            <button onClick={handleGenerateReport} className="btn-primary" disabled={trades.length === 0}>
              Generate Leak Report
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
          <div className="card overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="pb-3 text-left font-medium text-slate-500">Ticker</th>
                  <th className="pb-3 text-left font-medium text-slate-500">Action</th>
                  <th className="pb-3 text-right font-medium text-slate-500">Qty</th>
                  <th className="pb-3 text-right font-medium text-slate-500">Entry</th>
                  <th className="pb-3 text-right font-medium text-slate-500">Exit</th>
                  <th className="pb-3 text-right font-medium text-slate-500">P&L</th>
                  <th className="pb-3 text-center font-medium text-slate-500">Confidence</th>
                  <th className="pb-3 w-8"></th>
                </tr>
              </thead>
              <tbody>
                {trades.map((trade, i) => (
                  <tr key={i} className="border-b border-slate-100 last:border-0">
                    <td className="py-3">
                      <input className="input w-20 py-1 text-xs" value={trade.ticker}
                        onChange={(e) => updateTrade(i, "ticker", e.target.value)} />
                    </td>
                    <td className="py-3">
                      <select className="select w-20 py-1 text-xs" value={trade.action}
                        onChange={(e) => updateTrade(i, "action", e.target.value)}>
                        <option>BUY</option><option>SELL</option><option>SHORT</option><option>COVER</option>
                      </select>
                    </td>
                    <td className="py-3 text-right">
                      <input type="number" className="input w-20 py-1 text-xs text-right" value={trade.quantity}
                        onChange={(e) => updateTrade(i, "quantity", parseFloat(e.target.value) || 0)} />
                    </td>
                    <td className="py-3 text-right">
                      <input type="number" step="0.01" className="input w-24 py-1 text-xs text-right"
                        value={trade.entryPrice ?? ""} onChange={(e) => updateTrade(i, "entryPrice", parseFloat(e.target.value) || null)} />
                    </td>
                    <td className="py-3 text-right">
                      <input type="number" step="0.01" className="input w-24 py-1 text-xs text-right"
                        value={trade.exitPrice ?? ""} onChange={(e) => updateTrade(i, "exitPrice", parseFloat(e.target.value) || null)} />
                    </td>
                    <td className={`py-3 text-right text-xs font-medium ${(trade.pnl ?? 0) >= 0 ? "text-green-600" : "text-red-600"}`}>
                      {trade.pnl != null ? `$${trade.pnl.toFixed(2)}` : "—"}
                    </td>
                    <td className="py-3 text-center">
                      {trade.confidence != null && (
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                          trade.confidence >= 0.8 ? "bg-green-100 text-green-700" :
                          trade.confidence >= 0.5 ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700"
                        }`}>
                          {Math.round(trade.confidence * 100)}%
                        </span>
                      )}
                    </td>
                    <td className="py-3">
                      <button onClick={() => removeTrade(i)} className="text-slate-400 hover:text-red-500 p-1">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {step === "generating" && (
        <div className="card text-center py-16">
          <Loader2 className="h-10 w-10 text-brand-accent mx-auto mb-4 animate-spin" />
          <h3 className="text-lg font-semibold text-slate-900 mb-2">Generating your Leak Report...</h3>
          <p className="text-sm text-slate-600">Analyzing patterns, identifying leaks, building your fix plan. This takes about 15-30 seconds.</p>
        </div>
      )}

      {step === "done" && reportId && (
        <div className="card text-center py-16">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <Check className="h-8 w-8 text-green-600" />
          </div>
          <h3 className="text-xl font-semibold text-slate-900 mb-2">Your Leak Report is Ready!</h3>
          <p className="text-sm text-slate-600 mb-6">We analyzed {trades.length} trades and found actionable insights.</p>
          <button onClick={() => router.push(`/reports/${reportId}`)} className="btn-primary px-8 py-3">
            View My Leak Report
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
