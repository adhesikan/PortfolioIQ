"use client";

import { useState } from "react";
import { Holding } from "@/lib/types";

const emptyHolding: Holding = {
  ticker: "",
  quantity: 0,
  avgCost: null,
  assetClass: "equity",
  source: "manual"
};

const brokerPresets = ["Schwab", "Fidelity", "IBKR", "Robinhood", "Tradestation", "Other"];

export default function ImportWizard() {
  const [holdings, setHoldings] = useState<Holding[]>([{ ...emptyHolding }]);
  const [brokerPreset, setBrokerPreset] = useState("Other");
  const [status, setStatus] = useState("Awaiting upload");

  const updateHolding = (index: number, key: keyof Holding, value: string) => {
    const next = [...holdings];
    next[index] = {
      ...next[index],
      [key]: key === "quantity" || key === "avgCost" ? Number(value) : value
    };
    setHoldings(next);
  };

  const addRow = () => setHoldings([...holdings, { ...emptyHolding }]);

  return (
    <div className="space-y-8">
      <section className="card space-y-4">
        <h2 className="text-xl font-semibold text-slate-900">Screenshot Import</h2>
        <p className="text-sm text-slate-600">
          Upload brokerage screenshots (PNG/JPG). We use AI vision with OCR fallback. You can
          review and confirm before saving.
        </p>
        <div className="grid gap-4 md:grid-cols-[2fr,1fr]">
          <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-500">
            Drag & drop screenshots here or tap to upload. (Multi-image supported)
          </div>
          <div className="space-y-3 text-sm text-slate-600">
            <label className="text-xs uppercase tracking-wide text-slate-500">
              Broker template preset
            </label>
            <select
              value={brokerPreset}
              onChange={(event) => setBrokerPreset(event.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2"
            >
              {brokerPresets.map((preset) => (
                <option key={preset} value={preset}>
                  {preset}
                </option>
              ))}
            </select>
            <div className="rounded-lg bg-slate-100 px-3 py-2 text-xs text-slate-500">
              Extraction status: {status}
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 text-xs text-slate-500">
          We never store images permanently by default. You can opt in to save for 1 hour for
          support.
        </div>
      </section>

      <section className="card space-y-4">
        <h2 className="text-xl font-semibold text-slate-900">Fix & Confirm</h2>
        <p className="text-sm text-slate-600">
          Review extracted holdings, edit ambiguous tickers, and confirm before saving.
        </p>
        <div className="space-y-3">
          {holdings.map((holding, index) => (
            <div key={`${holding.ticker}-${index}`} className="grid gap-3 md:grid-cols-4">
              <input
                value={holding.ticker}
                placeholder="Ticker"
                onChange={(event) => updateHolding(index, "ticker", event.target.value)}
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
              <input
                value={holding.quantity}
                placeholder="Quantity"
                onChange={(event) => updateHolding(index, "quantity", event.target.value)}
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
              <input
                value={holding.avgCost ?? ""}
                placeholder="Avg Cost"
                onChange={(event) => updateHolding(index, "avgCost", event.target.value)}
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
              <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-500">
                Confidence: {holding.confidence ? Math.round(holding.confidence * 100) : 0}%
                <span className="rounded-full bg-emerald-100 px-2 py-1 text-[10px] font-semibold text-emerald-700">
                  High
                </span>
              </div>
            </div>
          ))}
        </div>
        <div className="flex flex-wrap gap-3">
          <button onClick={addRow} className="rounded-full border border-slate-300 px-4 py-2 text-sm">
            Add Row
          </button>
          <button className="rounded-full bg-brand-accent px-4 py-2 text-sm font-semibold text-white">
            Confirm & Save
          </button>
          <button className="rounded-full border border-slate-300 px-4 py-2 text-sm text-slate-500">
            Run validation
          </button>
        </div>
        <p className="text-xs text-slate-500">
          Confirming means you verify all holdings. PortfolioIQ will not save without your
          explicit confirmation.
        </p>
      </section>
    </div>
  );
}
