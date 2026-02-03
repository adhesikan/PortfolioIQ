export type AssetClass =
  | "equity"
  | "etf"
  | "crypto"
  | "cash"
  | "fixed-income"
  | "other";

export type Holding = {
  id?: string;
  ticker: string;
  name?: string;
  assetClass: AssetClass;
  sector?: string;
  region?: string;
  quantity: number;
  avgCost?: number | null;
  lastPrice?: number | null;
  value?: number | null;
  notes?: string | null;
  source: "manual" | "csv" | "image";
  confidence?: number | null;
};

export type Portfolio = {
  id: string;
  name: string;
  holdings: Holding[];
};

export type ScenarioShock = {
  bucket: string;
  shockPct: number;
  label: string;
};

export type StressScenario = {
  name: string;
  description: string;
  shocks: ScenarioShock[];
};

export type RebalancePreset =
  | "Balanced Growth"
  | "Growth + Income"
  | "Conservative Income"
  | "Aggressive Growth";

export type Recommendation = {
  ticker: string;
  action: "consider_buy" | "consider_trim";
  dollars: number;
  rationale: string;
  confidence: number;
};
