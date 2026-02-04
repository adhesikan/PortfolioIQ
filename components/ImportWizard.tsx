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

type ImportMethod = "manual" | "csv";

export default function ImportWizard() {
  const router = useRouter();
  const { createPortfolio } = usePortfolio();
  const [method, setMethod] = useState<ImportMethod>("manual");
  const [portfolioName, setPortfolioName] = useState("");
  const [holdings, setHoldings] = useState<Holding[]>([{ ...emptyHolding }]);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
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
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  }, [handleFileUpload]);

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
        <div className="flex gap-3">
          <button
            onClick={() => setMethod("manual")}
            className={`flex-1 rounded-xl border-2 p-4 text-left transition-all ${
              method === "manual"
                ? "border-brand-accent bg-blue-50"
                : "border-slate-200 hover:border-slate-300"
            }`}
          >
            <p className="font-semibold text-slate-900">Manual Entry</p>
            <p className="text-sm text-slate-500">Add holdings one by one</p>
          </button>
          <button
            onClick={() => setMethod("csv")}
            className={`flex-1 rounded-xl border-2 p-4 text-left transition-all ${
              method === "csv"
                ? "border-brand-accent bg-blue-50"
                : "border-slate-200 hover:border-slate-300"
            }`}
          >
            <p className="font-semibold text-slate-900">CSV Upload</p>
            <p className="text-sm text-slate-500">Import from spreadsheet</p>
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
