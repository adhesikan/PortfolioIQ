"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Holding, AssetClass } from "@/lib/types";
import { usePortfolio } from "@/contexts/PortfolioContext";

const emptyHolding: Holding = {
  ticker: "",
  quantity: 0,
  avgCost: null,
  assetClass: "equity",
  source: "manual"
};

const assetClasses: AssetClass[] = ["equity", "etf", "fixed-income", "crypto", "cash", "other"];

type ImportMethod = "manual" | "csv" | "image";

export default function ImportWizard() {
  const router = useRouter();
  const { createPortfolio } = usePortfolio();
  const [method, setMethod] = useState<ImportMethod>("manual");
  const [portfolioName, setPortfolioName] = useState("");
  const [holdings, setHoldings] = useState<Holding[]>([{ ...emptyHolding }]);
  const [isSaving, setIsSaving] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [imageWarnings, setImageWarnings] = useState<string[]>([]);
  const [imageSource, setImageSource] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);

  const updateHolding = (index: number, key: keyof Holding, value: string) => {
    const next = [...holdings];
    if (key === "quantity" || key === "avgCost") {
      const numValue = parseFloat(value);
      next[index] = { ...next[index], [key]: isNaN(numValue) ? null : numValue };
    } else {
      next[index] = { ...next[index], [key]: value };
    }
    setHoldings(next);
  };

  const addRow = () => setHoldings([...holdings, { ...emptyHolding }]);

  const removeRow = (index: number) => {
    if (holdings.length > 1) {
      setHoldings(holdings.filter((_, i) => i !== index));
    }
  };

  const parseCSVLine = (line: string): string[] => {
    const result: string[] = [];
    let current = "";
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = "";
      } else {
        current += char;
      }
    }
    result.push(current.trim());
    return result;
  };

  const parseCSV = (content: string): Holding[] => {
    const lines = content.trim().split(/\r?\n/);
    if (lines.length < 2) return [];

    const header = parseCSVLine(lines[0]).map((h) => h.toLowerCase());
    const tickerIdx = header.findIndex((h) => h.includes("ticker") || h.includes("symbol"));
    const qtyIdx = header.findIndex((h) => h.includes("quantity") || h.includes("shares") || h.includes("qty"));
    const costIdx = header.findIndex((h) => h.includes("cost") || h.includes("price") || h.includes("avg"));
    const classIdx = header.findIndex((h) => h.includes("class") || h.includes("type") || h.includes("asset"));

    if (tickerIdx === -1 || qtyIdx === -1) {
      throw new Error("CSV must contain ticker/symbol and quantity/shares columns");
    }

    return lines.slice(1).filter((line) => line.trim()).map((line) => {
      const cols = parseCSVLine(line);
      const rawClass = classIdx >= 0 ? cols[classIdx]?.toLowerCase() : "";
      const assetClass = assetClasses.includes(rawClass as AssetClass) ? (rawClass as AssetClass) : "equity";
      const qtyStr = cols[qtyIdx]?.replace(/[$,]/g, "") || "0";
      const costStr = costIdx >= 0 ? cols[costIdx]?.replace(/[$,]/g, "") || "" : "";
      
      return {
        ticker: cols[tickerIdx]?.toUpperCase().trim() || "",
        quantity: parseFloat(qtyStr) || 0,
        avgCost: costStr ? parseFloat(costStr) || null : null,
        assetClass,
        source: "csv" as const
      };
    }).filter((h) => h.ticker && h.quantity > 0);
  };

  const handleFileUpload = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const parsed = parseCSV(content);
        if (parsed.length === 0) {
          setError("No valid holdings found in CSV. Make sure it has ticker and quantity columns.");
          return;
        }
        setHoldings(parsed);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to parse CSV");
      }
    };
    reader.readAsText(file);
  }, []);

  const handleImageUpload = useCallback(async (file: File) => {
    setIsProcessing(true);
    setError(null);
    setImageWarnings([]);
    setImageSource(null);

    try {
      const reader = new FileReader();
      const base64 = await new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const response = await fetch("/api/parse-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: base64 })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to process image");
      }

      if (data.holdings && data.holdings.length > 0) {
        setHoldings(data.holdings);
        setImageWarnings(data.warnings || []);
        setImageSource(data.source);
        setError(null);
      } else {
        setError("No holdings found in the image. Please ensure the screenshot shows your holdings table clearly.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to process image");
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      if (method === "csv") {
        handleFileUpload(file);
      } else if (method === "image") {
        handleImageUpload(file);
      }
    }
  }, [method, handleFileUpload, handleImageUpload]);

  const handleSave = async () => {
    const validHoldings = holdings.filter((h) => h.ticker && h.quantity > 0);
    if (validHoldings.length === 0) {
      setError("Please add at least one holding with a ticker and quantity");
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const result = await createPortfolio(
        portfolioName || `Portfolio ${new Date().toLocaleDateString()}`,
        validHoldings
      );
      if (result) {
        setSuccess(true);
        setTimeout(() => {
          router.push("/dashboard");
        }, 1500);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save portfolio");
    } finally {
      setIsSaving(false);
    }
  };

  if (success) {
    return (
      <div className="card text-center animate-fade-in">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
          <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="section-title mb-2">Portfolio Saved!</h2>
        <p className="text-slate-600">Redirecting to your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="card">
        <h2 className="section-title mb-4">Portfolio Name</h2>
        <input
          type="text"
          value={portfolioName}
          onChange={(e) => setPortfolioName(e.target.value)}
          placeholder="e.g., Retirement Account, Growth Portfolio"
          className="input max-w-md"
        />
      </div>

      <div className="card">
        <h2 className="section-title mb-4">Import Method</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <button
            onClick={() => setMethod("manual")}
            className={`rounded-xl border-2 p-4 text-left transition-all ${
              method === "manual"
                ? "border-brand-accent bg-blue-50"
                : "border-slate-200 hover:border-slate-300"
            }`}
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100">
                <svg className="h-5 w-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              <p className="font-semibold text-slate-900">Manual Entry</p>
            </div>
            <p className="text-sm text-slate-500">Add holdings one by one</p>
          </button>
          <button
            onClick={() => setMethod("csv")}
            className={`rounded-xl border-2 p-4 text-left transition-all ${
              method === "csv"
                ? "border-brand-accent bg-blue-50"
                : "border-slate-200 hover:border-slate-300"
            }`}
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100">
                <svg className="h-5 w-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="font-semibold text-slate-900">CSV Upload</p>
            </div>
            <p className="text-sm text-slate-500">Import from spreadsheet</p>
          </button>
          <button
            onClick={() => setMethod("image")}
            className={`rounded-xl border-2 p-4 text-left transition-all ${
              method === "image"
                ? "border-brand-accent bg-blue-50"
                : "border-slate-200 hover:border-slate-300"
            }`}
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100">
                <svg className="h-5 w-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="font-semibold text-slate-900">AI Screenshot</p>
            </div>
            <p className="text-sm text-slate-500">Extract from brokerage screenshot</p>
          </button>
        </div>
      </div>

      {method === "csv" && (
        <div className="card animate-fade-in">
          <h2 className="section-title mb-4">Upload CSV</h2>
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`cursor-pointer rounded-xl border-2 border-dashed p-8 text-center transition-colors ${
              dragActive
                ? "border-brand-accent bg-blue-50"
                : "border-slate-300 hover:border-slate-400"
            }`}
          >
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
              <svg className="h-6 w-6 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <p className="font-medium text-slate-700">Drop your CSV here or click to browse</p>
            <p className="mt-1 text-sm text-slate-500">Requires columns: ticker/symbol, quantity/shares</p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
            className="hidden"
          />
        </div>
      )}

      {method === "image" && (
        <div className="card animate-fade-in">
          <h2 className="section-title mb-2">Upload Screenshot</h2>
          <p className="text-sm text-slate-600 mb-4">
            Take a screenshot of your holdings from your brokerage (Schwab, Fidelity, Vanguard, etc.)
          </p>
          
          <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 mb-4">
            <div className="flex gap-2">
              <svg className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div className="text-sm text-amber-800">
                <p className="font-medium">Privacy Notice</p>
                <p>AI will only extract holdings data (tickers, quantities, prices). Account numbers and personal information are automatically excluded.</p>
              </div>
            </div>
          </div>

          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => !isProcessing && imageInputRef.current?.click()}
            className={`cursor-pointer rounded-xl border-2 border-dashed p-8 text-center transition-colors ${
              isProcessing
                ? "border-purple-300 bg-purple-50"
                : dragActive
                ? "border-brand-accent bg-blue-50"
                : "border-slate-300 hover:border-slate-400"
            }`}
          >
            {isProcessing ? (
              <>
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center">
                  <svg className="h-8 w-8 text-purple-600 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                </div>
                <p className="font-medium text-purple-700">Processing image with AI...</p>
                <p className="mt-1 text-sm text-purple-600">This may take a few seconds</p>
              </>
            ) : (
              <>
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-purple-100">
                  <svg className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <p className="font-medium text-slate-700">Drop your screenshot here or click to browse</p>
                <p className="mt-1 text-sm text-slate-500">PNG, JPG, or JPEG (max 20MB)</p>
              </>
            )}
          </div>
          <input
            ref={imageInputRef}
            type="file"
            accept="image/png,image/jpeg,image/jpg"
            onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0])}
            className="hidden"
          />

          {imageSource && (
            <p className="mt-3 text-sm text-slate-600">
              Detected brokerage: <span className="font-medium">{imageSource}</span>
            </p>
          )}

          {imageWarnings.length > 0 && (
            <div className="mt-3 rounded-lg bg-yellow-50 p-3">
              <p className="text-sm font-medium text-yellow-800 mb-1">Notes from AI:</p>
              <ul className="text-sm text-yellow-700 list-disc list-inside">
                {imageWarnings.map((w, i) => (
                  <li key={i}>{w}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      <div className="card">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="section-title">Holdings ({holdings.filter(h => h.ticker).length})</h2>
          <button onClick={addRow} className="btn-secondary">
            + Add Row
          </button>
        </div>

        <div className="space-y-3">
          <div className="grid grid-cols-[1fr,1fr,1fr,1fr,auto] gap-3 text-xs font-medium uppercase tracking-wide text-slate-500">
            <span>Ticker</span>
            <span>Quantity</span>
            <span>Avg Cost ($)</span>
            <span>Asset Class</span>
            <span></span>
          </div>
          
          {holdings.map((holding, index) => (
            <div key={index} className="grid grid-cols-[1fr,1fr,1fr,1fr,auto] gap-3 animate-fade-in">
              <input
                value={holding.ticker}
                placeholder="AAPL"
                onChange={(e) => updateHolding(index, "ticker", e.target.value.toUpperCase())}
                className="input"
              />
              <input
                type="number"
                value={holding.quantity || ""}
                placeholder="100"
                onChange={(e) => updateHolding(index, "quantity", e.target.value)}
                className="input"
              />
              <input
                type="number"
                value={holding.avgCost ?? ""}
                placeholder="150.00"
                onChange={(e) => updateHolding(index, "avgCost", e.target.value)}
                className="input"
              />
              <select
                value={holding.assetClass}
                onChange={(e) => updateHolding(index, "assetClass", e.target.value)}
                className="select"
              >
                {assetClasses.map((ac) => (
                  <option key={ac} value={ac}>
                    {ac.charAt(0).toUpperCase() + ac.slice(1).replace("-", " ")}
                  </option>
                ))}
              </select>
              <button
                onClick={() => removeRow(index)}
                className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600"
                disabled={holdings.length === 1}
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700 animate-fade-in">
          {error}
        </div>
      )}

      <div className="flex items-center justify-between">
        <p className="text-xs text-slate-500">
          By saving, you confirm all holdings are accurate. This is for educational purposes only.
        </p>
        <div className="flex gap-3">
          <button onClick={() => setHoldings([{ ...emptyHolding }])} className="btn-secondary">
            Clear All
          </button>
          <button onClick={handleSave} disabled={isSaving} className="btn-primary">
            {isSaving ? "Saving..." : "Save Portfolio"}
          </button>
        </div>
      </div>
    </div>
  );
}
