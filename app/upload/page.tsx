"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useState, useRef, useCallback } from "react";
import { Upload, FileText, Image, AlertCircle, Loader2, Check, Edit3, Trash2, ArrowRight, Beaker, TrendingUp, TrendingDown, BarChart3, Zap, LineChart } from "lucide-react";
import Tooltip from "@/components/Tooltip";
import SampleDisclaimer from "@/components/SampleDisclaimer";

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

const SAMPLE_TYPES = [
  { type: "DAY_TRADER", label: "Day Trader", icon: Zap, badge: "Example Data", badgeColor: "bg-blue-100 text-blue-700", desc: "15 same-day trades" },
  { type: "SWING_TRADER", label: "Swing Trader", icon: TrendingUp, badge: "Example Data", badgeColor: "bg-purple-100 text-purple-700", desc: "12 multi-day holds" },
  { type: "MESSY", label: "Messy Trader", icon: TrendingDown, badge: "High Leaks", badgeColor: "bg-red-100 text-red-700", desc: "16 erratic trades" },
  { type: "DISCIPLINED", label: "Disciplined Trader", icon: BarChart3, badge: "Low Leaks", badgeColor: "bg-green-100 text-green-700", desc: "10 structured trades" },
  { type: "OPTIONS", label: "Options Trader", icon: LineChart, badge: "Example Data", badgeColor: "bg-amber-100 text-amber-700", desc: "10 option positions" },
];

export default function UploadPage() {
  const { user, refresh } = useAuth();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const csvInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState<Step>("upload");
  const [trades, setTrades] = useState<ExtractedTrade[]>([]);
  const [uploadId, setUploadId] = useState<string | null>(null);
  const [isSample, setIsSample] = useState(false);
  const [sampleType, setSampleType] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [reportId, setReportId] = useState<string | null>(null);
  const [showPaywall, setShowPaywall] = useState(false);
  const [showDisclaimerModal, setShowDisclaimerModal] = useState(false);
  const [pendingSampleType, setPendingSampleType] = useState<string | null>(null);
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false);

  if (!user) {
    router.push("/login");
    return null;
  }

  const freeUsed = user.usage?.freeReportsUsed ?? 0;
  const isPro = user.subscription?.status === "active";
  const atLimit = !isPro && freeUsed >= 3;
  const hasAcceptedDisclaimer = !!user.sampleDisclaimerAcceptedAt;

  const compressImage = (file: File, maxWidth = 1200): Promise<File> => {
    return new Promise((resolve) => {
      const img = new window.Image();
      img.onload = () => {
        if (img.width <= maxWidth) {
          resolve(file);
          return;
        }
        const scale = maxWidth / img.width;
        const canvas = document.createElement("canvas");
        canvas.width = maxWidth;
        canvas.height = img.height * scale;
        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        canvas.toBlob((blob) => {
          resolve(new File([blob!], file.name, { type: "image/jpeg" }));
        }, "image/jpeg", 0.8);
      };
      img.src = URL.createObjectURL(file);
    });
  };

  const handleScreenshot = async (file: File) => {
    setError("");
    setLoading(true);
    try {
      const compressed = await compressImage(file);
      const formData = new FormData();
      formData.append("file", compressed);
      const res = await fetch("/api/extract-trades", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Extraction failed");
      setTrades(data.trades);
      setUploadId(data.uploadId);
      setIsSample(false);
      setSampleType(null);
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
      setIsSample(false);
      setSampleType(null);
      setStep("confirm");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSampleClick = (type: string) => {
    if (hasAcceptedDisclaimer) {
      loadSampleData(type);
    } else {
      setPendingSampleType(type);
      setDisclaimerAccepted(false);
      setShowDisclaimerModal(true);
    }
  };

  const handleDisclaimerConfirm = () => {
    if (!disclaimerAccepted || !pendingSampleType) return;
    setShowDisclaimerModal(false);
    loadSampleData(pendingSampleType);
  };

  const loadSampleData = async (type: string) => {
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/reports/sample", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sampleType: type, disclaimerAccepted: true }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load sample data");
      setUploadId(data.uploadId);
      setIsSample(true);
      setSampleType(type);
      const tradesRes = await fetch(`/api/reports/sample-trades?uploadId=${data.uploadId}`);
      const tradesData = await tradesRes.json();
      if (tradesRes.ok && tradesData.trades) {
        setTrades(tradesData.trades);
      }
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
        body: JSON.stringify({ uploadId, trades, isSample, sampleType }),
      });
      const data = await res.json();
      if (res.status === 402) {
        setShowPaywall(true);
        setStep("confirm");
        return;
      }
      if (res.status === 429) {
        setError(data.message || "You've reached today's sample report limit. Try again tomorrow.");
        setStep("confirm");
        return;
      }
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
          <Tooltip content="Each successful report generation counts as one use. Sample reports do not count. You get 3 free reports for life.">
            <span className="text-sm text-blue-800">Free reports used: {freeUsed} / 3</span>
          </Tooltip>
          <div className="w-32 h-2 rounded-full bg-blue-200 overflow-hidden">
            <div className="h-full bg-brand-accent rounded-full" style={{ width: `${Math.min((freeUsed / 3) * 100, 100)}%` }}></div>
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
        <>
          <div className="mb-8">
            <div className="text-center mb-6">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-purple-100 px-3 py-1 text-xs font-semibold text-purple-700 mb-3">
                <Beaker className="h-3.5 w-3.5" />
                Try Sample Data
              </div>
              <h2 className="text-xl font-bold text-slate-900 mb-1">Try a Sample Leak Report</h2>
              <p className="text-sm text-slate-600">See how the Leak Report works using example trade history. Example only — not real trades.</p>
            </div>

            <div className="grid gap-3 grid-cols-2 lg:grid-cols-5 mb-4">
              {SAMPLE_TYPES.map((sample) => (
                <button
                  key={sample.type}
                  onClick={() => handleSampleClick(sample.type)}
                  disabled={loading}
                  className="card-hover text-center p-4 group transition-all hover:ring-2 hover:ring-brand-accent/30"
                >
                  <sample.icon className="h-7 w-7 text-slate-600 group-hover:text-brand-accent mx-auto mb-2 transition-colors" />
                  <p className="text-sm font-semibold text-slate-900 mb-1">{sample.label}</p>
                  <p className="text-xs text-slate-500 mb-2">{sample.desc}</p>
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${sample.badgeColor}`}>
                    {sample.badge}
                  </span>
                </button>
              ))}
            </div>

            <SampleDisclaimer compact />
            <p className="text-xs text-center text-green-700 mt-2">Sample reports are for demonstration only and do not count toward your 3 free reports.</p>
          </div>

          <div className="relative mb-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white px-4 text-slate-500">or upload your own trades</span>
            </div>
          </div>

          {atLimit && (
            <div className="mb-6 p-4 rounded-lg bg-amber-50 border border-amber-200 text-center">
              <AlertCircle className="h-8 w-8 text-amber-500 mx-auto mb-2" />
              <h3 className="font-semibold text-slate-900 mb-1">You&apos;ve used your 3 free reports</h3>
              <p className="text-sm text-slate-600 mb-3">Upgrade for unlimited reports, or try a sample report above.</p>
              <div className="flex flex-col sm:flex-row gap-2 justify-center">
                <a href="/pricing?reason=limit" className="btn-primary px-6 py-2 text-sm">Upgrade Now</a>
                <a href="/pricing" className="btn-secondary px-6 py-2 text-sm">View Plans</a>
              </div>
            </div>
          )}

          <div className={`grid gap-6 md:grid-cols-2 ${atLimit ? "opacity-50 pointer-events-none" : ""}`}>
            <div
              className="card-hover cursor-pointer text-center py-12"
              onClick={() => !atLimit && fileInputRef.current?.click()}
            >
              <Image className="h-12 w-12 text-brand-accent mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Upload Screenshot</h3>
              <p className="text-sm text-slate-600 mb-4">Take a screenshot of your brokerage trade history</p>
              <Tooltip content="Our AI reads your screenshot and automatically extracts trade data. Works with most brokerages. For best results, make sure the text is clearly visible.">
                <span className="text-xs text-slate-500">PNG, JPG up to 10MB</span>
              </Tooltip>
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
              <Tooltip content="CSV files give more accurate results than screenshots. Most brokerages let you export trade history as a CSV file from your account settings.">
                <span className="text-xs text-slate-500">CSV files up to 5MB</span>
              </Tooltip>
              <input
                ref={csvInputRef}
                type="file"
                accept=".csv"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && handleCSV(e.target.files[0])}
              />
            </div>
          </div>
        </>
      )}

      {loading && (
        <div className="card text-center py-16">
          <Loader2 className="h-10 w-10 text-brand-accent mx-auto mb-4 animate-spin" />
          <h3 className="text-lg font-semibold text-slate-900 mb-2">
            {isSample ? "Loading sample trades..." : "Extracting trades..."}
          </h3>
          <p className="text-sm text-slate-600">
            {isSample ? "Preparing example trade data for review." : "Our AI is reading your trade data. This may take a moment."}
          </p>
        </div>
      )}

      {step === "confirm" && !loading && (
        <div>
          {isSample && (
            <div className="mb-4">
              <SampleDisclaimer compact />
            </div>
          )}
          <div className="flex items-center justify-between mb-4">
            <Tooltip content={isSample ? "Review the sample trades. You can edit values or remove rows before generating the report." : "Review the trades our AI extracted. You can edit any values or remove incorrect rows before generating your report."}>
              <h2 className="text-xl font-semibold text-slate-900">
                {isSample ? `Sample Trades — ${SAMPLE_TYPES.find(s => s.type === sampleType)?.label || "Example"} (${trades.length})` : `Confirm Extracted Trades (${trades.length})`}
              </h2>
            </Tooltip>
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
                  <th className="pb-3 text-right font-medium text-slate-500">
                    <Tooltip content="The price at which you entered (opened) the trade.">
                      <span>Entry</span>
                    </Tooltip>
                  </th>
                  <th className="pb-3 text-right font-medium text-slate-500">
                    <Tooltip content="The price at which you exited (closed) the trade.">
                      <span>Exit</span>
                    </Tooltip>
                  </th>
                  <th className="pb-3 text-right font-medium text-slate-500">
                    <Tooltip content="Profit or loss for this trade. Green means profit, red means loss.">
                      <span>P&L</span>
                    </Tooltip>
                  </th>
                  <th className="pb-3 text-center font-medium text-slate-500">
                    <Tooltip content={isSample ? "Sample data is always 100% confidence." : "How confident our AI is about the extracted data for this trade. Below 50% means you should double-check the values."}>
                      <span>Confidence</span>
                    </Tooltip>
                  </th>
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
          <h3 className="text-xl font-semibold text-slate-900 mb-2">
            {isSample ? "Your Sample Leak Report is Ready!" : "Your Leak Report is Ready!"}
          </h3>
          <p className="text-sm text-slate-600 mb-6">We analyzed {trades.length} trades and found actionable insights.</p>
          {isSample && (
            <div className="mb-4 max-w-md mx-auto">
              <SampleDisclaimer compact />
            </div>
          )}
          <button onClick={() => router.push(`/reports/${reportId}`)} className="btn-primary px-8 py-3">
            View My Leak Report
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      )}

      {showPaywall && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8 text-center">
            <AlertCircle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-slate-900 mb-2">You&apos;ve used your 3 free reports</h2>
            <p className="text-slate-600 mb-6">Upgrade for unlimited reports, saved history, and weekly insights.</p>
            <div className="flex flex-col gap-3">
              <a href="/pricing?reason=limit" className="btn-primary w-full py-3">Upgrade Now</a>
              <a href="/pricing" className="btn-secondary w-full py-3">View Plans</a>
              <button onClick={() => setShowPaywall(false)} className="text-sm text-slate-500 hover:text-slate-700 mt-1">
                Maybe later
              </button>
            </div>
          </div>
        </div>
      )}

      {showDisclaimerModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Before using sample data</h3>
            <SampleDisclaimer />
            <label className="flex items-start gap-3 mt-5 cursor-pointer">
              <input
                type="checkbox"
                checked={disclaimerAccepted}
                onChange={(e) => setDisclaimerAccepted(e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-slate-300 text-brand-accent focus:ring-brand-accent"
              />
              <span className="text-sm text-slate-700">
                I understand this is example data for demonstration purposes only, not financial advice.
              </span>
            </label>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowDisclaimerModal(false)}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
              <button
                onClick={handleDisclaimerConfirm}
                disabled={!disclaimerAccepted}
                className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
