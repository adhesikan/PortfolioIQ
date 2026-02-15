export type SampleType = "DAY_TRADER" | "SWING_TRADER" | "MESSY" | "DISCIPLINED" | "OPTIONS";

export interface SampleTrade {
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
  notes: string | null;
}

export interface SampleDataset {
  label: string;
  description: string;
  badge: string;
  badgeColor: string;
  notes: string;
  trades: SampleTrade[];
}

const DAY_TRADER: SampleTrade[] = [
  { ticker: "AAPL", action: "BUY", quantity: 100, entryPrice: 188.50, exitPrice: 190.20, entryDate: "2026-01-06", exitDate: "2026-01-06", pnl: 170, pnlPercent: 0.9, holdingDays: 0, confidence: null, notes: null },
  { ticker: "TSLA", action: "BUY", quantity: 50, entryPrice: 252.00, exitPrice: 248.30, entryDate: "2026-01-06", exitDate: "2026-01-06", pnl: -185, pnlPercent: -1.5, holdingDays: 0, confidence: null, notes: null },
  { ticker: "NVDA", action: "BUY", quantity: 80, entryPrice: 142.10, exitPrice: 143.90, entryDate: "2026-01-07", exitDate: "2026-01-07", pnl: 144, pnlPercent: 1.3, holdingDays: 0, confidence: null, notes: null },
  { ticker: "MSFT", action: "SHORT", quantity: 60, entryPrice: 415.80, exitPrice: 417.50, entryDate: "2026-01-07", exitDate: "2026-01-07", pnl: -102, pnlPercent: -0.4, holdingDays: 0, confidence: null, notes: null },
  { ticker: "META", action: "BUY", quantity: 40, entryPrice: 585.20, exitPrice: 589.10, entryDate: "2026-01-08", exitDate: "2026-01-08", pnl: 156, pnlPercent: 0.7, holdingDays: 0, confidence: null, notes: null },
  { ticker: "AMD", action: "BUY", quantity: 150, entryPrice: 128.40, exitPrice: 126.80, entryDate: "2026-01-08", exitDate: "2026-01-08", pnl: -240, pnlPercent: -1.2, holdingDays: 0, confidence: null, notes: null },
  { ticker: "GOOGL", action: "BUY", quantity: 70, entryPrice: 193.60, exitPrice: 195.40, entryDate: "2026-01-09", exitDate: "2026-01-09", pnl: 126, pnlPercent: 0.9, holdingDays: 0, confidence: null, notes: null },
  { ticker: "AAPL", action: "SHORT", quantity: 90, entryPrice: 191.00, exitPrice: 189.70, entryDate: "2026-01-09", exitDate: "2026-01-09", pnl: 117, pnlPercent: 0.7, holdingDays: 0, confidence: null, notes: null },
  { ticker: "AMZN", action: "BUY", quantity: 55, entryPrice: 226.30, exitPrice: 224.10, entryDate: "2026-01-10", exitDate: "2026-01-10", pnl: -121, pnlPercent: -1.0, holdingDays: 0, confidence: null, notes: null },
  { ticker: "TSLA", action: "BUY", quantity: 45, entryPrice: 249.80, exitPrice: 253.60, entryDate: "2026-01-10", exitDate: "2026-01-10", pnl: 171, pnlPercent: 1.5, holdingDays: 0, confidence: null, notes: null },
  { ticker: "SPY", action: "BUY", quantity: 200, entryPrice: 598.20, exitPrice: 596.10, entryDate: "2026-01-13", exitDate: "2026-01-13", pnl: -420, pnlPercent: -0.4, holdingDays: 0, confidence: null, notes: null },
  { ticker: "QQQ", action: "BUY", quantity: 120, entryPrice: 510.50, exitPrice: 513.20, entryDate: "2026-01-13", exitDate: "2026-01-13", pnl: 324, pnlPercent: 0.5, holdingDays: 0, confidence: null, notes: null },
  { ticker: "NVDA", action: "BUY", quantity: 100, entryPrice: 144.20, exitPrice: 142.90, entryDate: "2026-01-14", exitDate: "2026-01-14", pnl: -130, pnlPercent: -0.9, holdingDays: 0, confidence: null, notes: null },
  { ticker: "META", action: "BUY", quantity: 35, entryPrice: 590.80, exitPrice: 594.50, entryDate: "2026-01-14", exitDate: "2026-01-14", pnl: 129.50, pnlPercent: 0.6, holdingDays: 0, confidence: null, notes: null },
  { ticker: "AAPL", action: "BUY", quantity: 80, entryPrice: 189.30, exitPrice: 187.60, entryDate: "2026-01-15", exitDate: "2026-01-15", pnl: -136, pnlPercent: -0.9, holdingDays: 0, confidence: null, notes: null },
];

const SWING_TRADER: SampleTrade[] = [
  { ticker: "AAPL", action: "BUY", quantity: 100, entryPrice: 185.20, exitPrice: 192.80, entryDate: "2026-01-05", exitDate: "2026-01-12", pnl: 760, pnlPercent: 4.1, holdingDays: 7, confidence: null, notes: null },
  { ticker: "TSLA", action: "BUY", quantity: 40, entryPrice: 248.50, exitPrice: 242.10, entryDate: "2026-01-06", exitDate: "2026-01-16", pnl: -256, pnlPercent: -2.6, holdingDays: 10, confidence: null, notes: null },
  { ticker: "NVDA", action: "BUY", quantity: 80, entryPrice: 138.90, exitPrice: 148.30, entryDate: "2026-01-07", exitDate: "2026-01-14", pnl: 752, pnlPercent: 6.8, holdingDays: 7, confidence: null, notes: null },
  { ticker: "MSFT", action: "BUY", quantity: 50, entryPrice: 410.20, exitPrice: 405.80, entryDate: "2026-01-08", exitDate: "2026-01-22", pnl: -220, pnlPercent: -1.1, holdingDays: 14, confidence: null, notes: null },
  { ticker: "AMZN", action: "BUY", quantity: 60, entryPrice: 220.40, exitPrice: 228.90, entryDate: "2026-01-09", exitDate: "2026-01-15", pnl: 510, pnlPercent: 3.9, holdingDays: 6, confidence: null, notes: null },
  { ticker: "META", action: "BUY", quantity: 30, entryPrice: 578.60, exitPrice: 570.20, entryDate: "2026-01-10", exitDate: "2026-01-24", pnl: -252, pnlPercent: -1.5, holdingDays: 14, confidence: null, notes: null },
  { ticker: "GOOGL", action: "BUY", quantity: 70, entryPrice: 190.30, exitPrice: 196.50, entryDate: "2026-01-12", exitDate: "2026-01-19", pnl: 434, pnlPercent: 3.3, holdingDays: 7, confidence: null, notes: null },
  { ticker: "AMD", action: "BUY", quantity: 100, entryPrice: 130.50, exitPrice: 125.80, entryDate: "2026-01-13", exitDate: "2026-01-27", pnl: -470, pnlPercent: -3.6, holdingDays: 14, confidence: null, notes: null },
  { ticker: "DIS", action: "BUY", quantity: 80, entryPrice: 112.40, exitPrice: 116.90, entryDate: "2026-01-14", exitDate: "2026-01-20", pnl: 360, pnlPercent: 4.0, holdingDays: 6, confidence: null, notes: null },
  { ticker: "JPM", action: "BUY", quantity: 45, entryPrice: 248.30, exitPrice: 252.10, entryDate: "2026-01-15", exitDate: "2026-01-21", pnl: 171, pnlPercent: 1.5, holdingDays: 6, confidence: null, notes: null },
  { ticker: "CRM", action: "BUY", quantity: 35, entryPrice: 340.20, exitPrice: 335.40, entryDate: "2026-01-16", exitDate: "2026-01-30", pnl: -168, pnlPercent: -1.4, holdingDays: 14, confidence: null, notes: null },
  { ticker: "NFLX", action: "BUY", quantity: 25, entryPrice: 920.50, exitPrice: 945.80, entryDate: "2026-01-19", exitDate: "2026-01-26", pnl: 632.50, pnlPercent: 2.7, holdingDays: 7, confidence: null, notes: null },
];

const MESSY_TRADER: SampleTrade[] = [
  { ticker: "TSLA", action: "BUY", quantity: 200, entryPrice: 250.00, exitPrice: 244.20, entryDate: "2026-01-06", exitDate: "2026-01-06", pnl: -1160, pnlPercent: -2.3, holdingDays: 0, confidence: null, notes: null },
  { ticker: "TSLA", action: "BUY", quantity: 300, entryPrice: 243.80, exitPrice: 241.50, entryDate: "2026-01-06", exitDate: "2026-01-06", pnl: -690, pnlPercent: -0.9, holdingDays: 0, confidence: null, notes: null },
  { ticker: "NVDA", action: "BUY", quantity: 50, entryPrice: 140.20, exitPrice: 141.80, entryDate: "2026-01-07", exitDate: "2026-01-07", pnl: 80, pnlPercent: 1.1, holdingDays: 0, confidence: null, notes: null },
  { ticker: "AAPL", action: "BUY", quantity: 400, entryPrice: 189.50, exitPrice: 187.90, entryDate: "2026-01-07", exitDate: "2026-01-07", pnl: -640, pnlPercent: -0.8, holdingDays: 0, confidence: null, notes: null },
  { ticker: "AAPL", action: "BUY", quantity: 500, entryPrice: 187.80, exitPrice: 186.10, entryDate: "2026-01-07", exitDate: "2026-01-07", pnl: -850, pnlPercent: -0.9, holdingDays: 0, confidence: null, notes: null },
  { ticker: "AMD", action: "BUY", quantity: 100, entryPrice: 128.60, exitPrice: 130.10, entryDate: "2026-01-08", exitDate: "2026-01-08", pnl: 150, pnlPercent: 1.2, holdingDays: 0, confidence: null, notes: null },
  { ticker: "TSLA", action: "SHORT", quantity: 250, entryPrice: 246.00, exitPrice: 249.30, entryDate: "2026-01-08", exitDate: "2026-01-08", pnl: -825, pnlPercent: -1.3, holdingDays: 0, confidence: null, notes: null },
  { ticker: "META", action: "BUY", quantity: 20, entryPrice: 585.40, exitPrice: 588.20, entryDate: "2026-01-09", exitDate: "2026-01-09", pnl: 56, pnlPercent: 0.5, holdingDays: 0, confidence: null, notes: null },
  { ticker: "NVDA", action: "BUY", quantity: 350, entryPrice: 141.50, exitPrice: 139.80, entryDate: "2026-01-09", exitDate: "2026-01-09", pnl: -595, pnlPercent: -1.2, holdingDays: 0, confidence: null, notes: null },
  { ticker: "SPY", action: "BUY", quantity: 600, entryPrice: 597.30, exitPrice: 595.10, entryDate: "2026-01-10", exitDate: "2026-01-10", pnl: -1320, pnlPercent: -0.4, holdingDays: 0, confidence: null, notes: null },
  { ticker: "TSLA", action: "BUY", quantity: 150, entryPrice: 248.90, exitPrice: 250.40, entryDate: "2026-01-10", exitDate: "2026-01-10", pnl: 225, pnlPercent: 0.6, holdingDays: 0, confidence: null, notes: null },
  { ticker: "AMZN", action: "BUY", quantity: 80, entryPrice: 225.60, exitPrice: 223.40, entryDate: "2026-01-13", exitDate: "2026-01-13", pnl: -176, pnlPercent: -1.0, holdingDays: 0, confidence: null, notes: null },
  { ticker: "QQQ", action: "SHORT", quantity: 300, entryPrice: 511.20, exitPrice: 514.80, entryDate: "2026-01-13", exitDate: "2026-01-13", pnl: -1080, pnlPercent: -0.7, holdingDays: 0, confidence: null, notes: null },
  { ticker: "GOOGL", action: "BUY", quantity: 60, entryPrice: 194.10, exitPrice: 195.50, entryDate: "2026-01-14", exitDate: "2026-01-14", pnl: 84, pnlPercent: 0.7, holdingDays: 0, confidence: null, notes: null },
  { ticker: "NVDA", action: "BUY", quantity: 400, entryPrice: 143.20, exitPrice: 140.90, entryDate: "2026-01-14", exitDate: "2026-01-14", pnl: -920, pnlPercent: -1.6, holdingDays: 0, confidence: null, notes: null },
  { ticker: "TSLA", action: "BUY", quantity: 180, entryPrice: 251.40, exitPrice: 253.10, entryDate: "2026-01-15", exitDate: "2026-01-15", pnl: 306, pnlPercent: 0.7, holdingDays: 0, confidence: null, notes: null },
];

const DISCIPLINED_TRADER: SampleTrade[] = [
  { ticker: "AAPL", action: "BUY", quantity: 50, entryPrice: 186.20, exitPrice: 192.40, entryDate: "2026-01-06", exitDate: "2026-01-10", pnl: 310, pnlPercent: 3.3, holdingDays: 4, confidence: null, notes: null },
  { ticker: "MSFT", action: "BUY", quantity: 50, entryPrice: 408.30, exitPrice: 415.60, entryDate: "2026-01-07", exitDate: "2026-01-13", pnl: 365, pnlPercent: 1.8, holdingDays: 6, confidence: null, notes: null },
  { ticker: "GOOGL", action: "BUY", quantity: 50, entryPrice: 191.40, exitPrice: 189.80, entryDate: "2026-01-08", exitDate: "2026-01-10", pnl: -80, pnlPercent: -0.8, holdingDays: 2, confidence: null, notes: null },
  { ticker: "NVDA", action: "BUY", quantity: 50, entryPrice: 139.80, exitPrice: 146.20, entryDate: "2026-01-09", exitDate: "2026-01-14", pnl: 320, pnlPercent: 4.6, holdingDays: 5, confidence: null, notes: null },
  { ticker: "AMZN", action: "BUY", quantity: 50, entryPrice: 222.10, exitPrice: 228.40, entryDate: "2026-01-10", exitDate: "2026-01-16", pnl: 315, pnlPercent: 2.8, holdingDays: 6, confidence: null, notes: null },
  { ticker: "META", action: "BUY", quantity: 50, entryPrice: 580.90, exitPrice: 576.20, entryDate: "2026-01-13", exitDate: "2026-01-15", pnl: -235, pnlPercent: -0.8, holdingDays: 2, confidence: null, notes: null },
  { ticker: "JPM", action: "BUY", quantity: 50, entryPrice: 245.60, exitPrice: 251.30, entryDate: "2026-01-14", exitDate: "2026-01-20", pnl: 285, pnlPercent: 2.3, holdingDays: 6, confidence: null, notes: null },
  { ticker: "NFLX", action: "BUY", quantity: 50, entryPrice: 918.20, exitPrice: 912.40, entryDate: "2026-01-15", exitDate: "2026-01-17", pnl: -290, pnlPercent: -0.6, holdingDays: 2, confidence: null, notes: null },
  { ticker: "CRM", action: "BUY", quantity: 50, entryPrice: 335.80, exitPrice: 344.20, entryDate: "2026-01-16", exitDate: "2026-01-22", pnl: 420, pnlPercent: 2.5, holdingDays: 6, confidence: null, notes: null },
  { ticker: "DIS", action: "BUY", quantity: 50, entryPrice: 110.50, exitPrice: 114.80, entryDate: "2026-01-19", exitDate: "2026-01-23", pnl: 215, pnlPercent: 3.9, holdingDays: 4, confidence: null, notes: null },
];

const OPTIONS_TRADER: SampleTrade[] = [
  { ticker: "AAPL 2026-03-20 190C", action: "BUY", quantity: 10, entryPrice: 5.20, exitPrice: 7.80, entryDate: "2026-01-06", exitDate: "2026-01-10", pnl: 2600, pnlPercent: 50.0, holdingDays: 4, confidence: null, notes: "Premium per contract. Multiplier: 100." },
  { ticker: "TSLA 2026-02-21 260C", action: "BUY", quantity: 5, entryPrice: 8.40, exitPrice: 4.10, entryDate: "2026-01-07", exitDate: "2026-01-14", pnl: -2150, pnlPercent: -51.2, holdingDays: 7, confidence: null, notes: "Premium per contract. Multiplier: 100." },
  { ticker: "NVDA 2026-03-20 150C", action: "BUY", quantity: 8, entryPrice: 6.30, exitPrice: 9.50, entryDate: "2026-01-08", exitDate: "2026-01-13", pnl: 2560, pnlPercent: 50.8, holdingDays: 5, confidence: null, notes: "Premium per contract. Multiplier: 100." },
  { ticker: "SPY 2026-02-21 600P", action: "BUY", quantity: 15, entryPrice: 4.80, exitPrice: 3.20, entryDate: "2026-01-09", exitDate: "2026-01-13", pnl: -2400, pnlPercent: -33.3, holdingDays: 4, confidence: null, notes: "Premium per contract. Multiplier: 100." },
  { ticker: "META 2026-03-20 600C", action: "BUY", quantity: 4, entryPrice: 12.50, exitPrice: 18.30, entryDate: "2026-01-10", exitDate: "2026-01-16", pnl: 2320, pnlPercent: 46.4, holdingDays: 6, confidence: null, notes: "Premium per contract. Multiplier: 100." },
  { ticker: "AMD 2026-02-21 135C", action: "BUY", quantity: 12, entryPrice: 3.90, exitPrice: 2.10, entryDate: "2026-01-13", exitDate: "2026-01-20", pnl: -2160, pnlPercent: -46.2, holdingDays: 7, confidence: null, notes: "Premium per contract. Multiplier: 100." },
  { ticker: "GOOGL 2026-03-20 200C", action: "BUY", quantity: 6, entryPrice: 7.10, exitPrice: 10.40, entryDate: "2026-01-14", exitDate: "2026-01-19", pnl: 1980, pnlPercent: 46.5, holdingDays: 5, confidence: null, notes: "Premium per contract. Multiplier: 100." },
  { ticker: "MSFT 2026-02-21 420C", action: "BUY", quantity: 7, entryPrice: 9.80, exitPrice: 6.50, entryDate: "2026-01-15", exitDate: "2026-01-22", pnl: -2310, pnlPercent: -33.7, holdingDays: 7, confidence: null, notes: "Premium per contract. Multiplier: 100." },
  { ticker: "AMZN 2026-03-20 235C", action: "BUY", quantity: 10, entryPrice: 5.60, exitPrice: 8.90, entryDate: "2026-01-16", exitDate: "2026-01-21", pnl: 3300, pnlPercent: 58.9, holdingDays: 5, confidence: null, notes: "Premium per contract. Multiplier: 100." },
  { ticker: "QQQ 2026-02-21 520C", action: "BUY", quantity: 8, entryPrice: 7.20, exitPrice: 4.80, entryDate: "2026-01-19", exitDate: "2026-01-26", pnl: -1920, pnlPercent: -33.3, holdingDays: 7, confidence: null, notes: "Premium per contract. Multiplier: 100." },
];

const DATASETS: Record<SampleType, SampleDataset> = {
  DAY_TRADER: {
    label: "Day Trader",
    description: "15 same-day trades with mixed wins and losses. Moderate behavioral leaks.",
    badge: "Example Data",
    badgeColor: "bg-blue-100 text-blue-700",
    notes: "All trades are intraday (opened and closed same day). Example data for demonstration only.",
    trades: DAY_TRADER,
  },
  SWING_TRADER: {
    label: "Swing Trader",
    description: "12 multi-day positions held 6-14 days. Shows tendency to hold losers longer.",
    badge: "Example Data",
    badgeColor: "bg-purple-100 text-purple-700",
    notes: "Multi-day hold positions. Losing trades are held longer than winners. Example data for demonstration only.",
    trades: SWING_TRADER,
  },
  MESSY: {
    label: "Messy Trader",
    description: "16 trades with erratic sizing, clustering, and large losses. Expect high-severity leaks.",
    badge: "High Leaks",
    badgeColor: "bg-red-100 text-red-700",
    notes: "This example demonstrates a trader with significant behavioral issues: inconsistent sizing, revenge trading clusters, and oversized losses. Example data for demonstration only.",
    trades: MESSY_TRADER,
  },
  DISCIPLINED: {
    label: "Disciplined Trader",
    description: "10 trades with consistent sizing and controlled losses. Expect low-severity leaks.",
    badge: "Low Leaks",
    badgeColor: "bg-green-100 text-green-700",
    notes: "This example shows consistent position sizing and quicker exits on losing trades. Some losses are still present — no strategy is loss-free. Example data for demonstration only.",
    trades: DISCIPLINED_TRADER,
  },
  OPTIONS: {
    label: "Options Trader",
    description: "10 options positions using premium-based P/L. Large % swings typical of options.",
    badge: "Example Data",
    badgeColor: "bg-amber-100 text-amber-700",
    notes: "Options P/L reflects premium per contract with 100x multiplier assumption. Actual results depend on broker conventions, commissions, and execution quality. Example data for demonstration only.",
    trades: OPTIONS_TRADER,
  },
};

export function getSampleDataset(sampleType: SampleType): SampleDataset {
  return DATASETS[sampleType];
}

export function getSampleTrades(sampleType: SampleType): SampleTrade[] {
  return DATASETS[sampleType].trades;
}

export function getAllSampleTypes(): { type: SampleType; dataset: SampleDataset }[] {
  return (Object.keys(DATASETS) as SampleType[]).map((type) => ({
    type,
    dataset: DATASETS[type],
  }));
}
