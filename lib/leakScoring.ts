interface Trade {
  ticker?: string;
  action?: string;
  quantity?: number;
  entryPrice?: number | null;
  exitPrice?: number | null;
  entryDate?: string | null;
  exitDate?: string | null;
  pnl?: number | null;
  pnlPercent?: number | null;
  holdingDays?: number | null;
  confidence?: number | null;
}

interface TradeMetrics {
  totalTrades: number;
  winRate: number;
  avgRR: number;
  avgWin: number;
  avgLoss: number;
  biggestWin: number;
  biggestLoss: number;
  avgHoldWinDays: number;
  avgHoldLossDays: number;
  profitFactor: number;
  maxConsecutiveLosses: number;
  revengeTradeRatio: number;
  oversizingRatio: number;
  earlyExitRatio: number;
  lateExitRatio: number;
}

interface ScoreBreakdown {
  category: string;
  label: string;
  score: number;
  maxScore: number;
  detail: string;
}

interface LeakScoringResult {
  leakScore: number;
  breakdown: ScoreBreakdown[];
  metrics: TradeMetrics;
}

function computeMetrics(trades: Trade[]): TradeMetrics {
  const resolved = trades.map((t) => {
    let pnl = t.pnl ?? null;
    if (pnl == null && t.entryPrice != null && t.exitPrice != null) {
      const qty = t.quantity || 1;
      const isShort = t.action?.toUpperCase().includes("SHORT") || t.action?.toUpperCase().includes("SELL");
      pnl = isShort
        ? (t.entryPrice - t.exitPrice) * qty
        : (t.exitPrice - t.entryPrice) * qty;
    }

    let holdDays = t.holdingDays ?? null;
    if (holdDays == null && t.entryDate && t.exitDate) {
      const d1 = new Date(t.entryDate);
      const d2 = new Date(t.exitDate);
      if (!isNaN(d1.getTime()) && !isNaN(d2.getTime())) {
        holdDays = Math.max(0, Math.round((d2.getTime() - d1.getTime()) / 86400000));
      }
    }

    return { ...t, pnl, holdingDays: holdDays };
  });

  const withPnl = resolved.filter((t) => t.pnl != null);
  const wins = withPnl.filter((t) => (t.pnl ?? 0) > 0);
  const losses = withPnl.filter((t) => (t.pnl ?? 0) < 0);

  const winRate = withPnl.length > 0 ? wins.length / withPnl.length : 0;

  const avgWin = wins.length > 0 ? wins.reduce((s, t) => s + (t.pnl ?? 0), 0) / wins.length : 0;
  const avgLoss = losses.length > 0 ? Math.abs(losses.reduce((s, t) => s + (t.pnl ?? 0), 0) / losses.length) : 0;
  const avgRR = avgLoss > 0 ? avgWin / avgLoss : avgWin > 0 ? 3 : 0;

  const biggestWin = wins.length > 0 ? Math.max(...wins.map((t) => t.pnl ?? 0)) : 0;
  const biggestLoss = losses.length > 0 ? Math.min(...losses.map((t) => t.pnl ?? 0)) : 0;

  const totalWins = wins.reduce((s, t) => s + (t.pnl ?? 0), 0);
  const totalLosses = Math.abs(losses.reduce((s, t) => s + (t.pnl ?? 0), 0));
  const profitFactor = totalLosses > 0 ? totalWins / totalLosses : totalWins > 0 ? 3 : 0;

  const winsWithHold = wins.filter((t) => t.holdingDays != null);
  const lossesWithHold = losses.filter((t) => t.holdingDays != null);
  const avgHoldWinDays = winsWithHold.length > 0 ? winsWithHold.reduce((s, t) => s + (t.holdingDays ?? 0), 0) / winsWithHold.length : 0;
  const avgHoldLossDays = lossesWithHold.length > 0 ? lossesWithHold.reduce((s, t) => s + (t.holdingDays ?? 0), 0) / lossesWithHold.length : 0;

  const chronological = [...withPnl].sort((a, b) => {
    const da = a.entryDate || a.exitDate || "";
    const db = b.entryDate || b.exitDate || "";
    return da.localeCompare(db);
  });

  let maxConsecutiveLosses = 0;
  let currentStreak = 0;
  for (const t of chronological) {
    if ((t.pnl ?? 0) < 0) {
      currentStreak++;
      maxConsecutiveLosses = Math.max(maxConsecutiveLosses, currentStreak);
    } else {
      currentStreak = 0;
    }
  }

  let revengeTradeCount = 0;
  for (let i = 1; i < chronological.length; i++) {
    const prev = chronological[i - 1];
    const curr = chronological[i];
    if ((prev.pnl ?? 0) < 0) {
      const prevDate = prev.exitDate || prev.entryDate || "";
      const currDate = curr.entryDate || curr.exitDate || "";
      if (prevDate && currDate) {
        const d1 = new Date(prevDate);
        const d2 = new Date(currDate);
        const diffHours = (d2.getTime() - d1.getTime()) / 3600000;
        if (diffHours >= 0 && diffHours < 2 && (curr.pnl ?? 0) < 0) {
          revengeTradeCount++;
        }
      }
    }
  }
  const revengeTradeRatio = withPnl.length > 1 ? revengeTradeCount / (withPnl.length - 1) : 0;

  const quantities = withPnl.map((t) => t.quantity || 1);
  const avgQty = quantities.reduce((s, q) => s + q, 0) / quantities.length;
  const oversized = quantities.filter((q) => q > avgQty * 2).length;
  const oversizingRatio = withPnl.length > 0 ? oversized / withPnl.length : 0;

  let earlyExitCount = 0;
  let lateExitCount = 0;
  if (avgHoldWinDays > 0) {
    for (const t of wins) {
      if (t.holdingDays != null) {
        if (t.holdingDays < avgHoldWinDays * 0.3) earlyExitCount++;
      }
    }
    earlyExitCount = wins.length > 0 ? earlyExitCount : 0;
  }
  if (avgHoldLossDays > 0) {
    for (const t of losses) {
      if (t.holdingDays != null) {
        if (t.holdingDays > avgHoldLossDays * 2) lateExitCount++;
      }
    }
  }
  const earlyExitRatio = wins.length > 0 ? earlyExitCount / wins.length : 0;
  const lateExitRatio = losses.length > 0 ? lateExitCount / losses.length : 0;

  return {
    totalTrades: trades.length,
    winRate,
    avgRR,
    avgWin,
    avgLoss,
    biggestWin,
    biggestLoss,
    avgHoldWinDays,
    avgHoldLossDays,
    profitFactor,
    maxConsecutiveLosses,
    revengeTradeRatio,
    oversizingRatio,
    earlyExitRatio,
    lateExitRatio,
  };
}

function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

function lerp(val: number, fromLow: number, fromHigh: number, toLow: number, toHigh: number): number {
  if (fromHigh === fromLow) return toHigh;
  const ratio = (val - fromLow) / (fromHigh - fromLow);
  return toLow + clamp(ratio, 0, 1) * (toHigh - toLow);
}

export function calculateLeakScore(trades: Trade[]): LeakScoringResult {
  const m = computeMetrics(trades);
  const breakdown: ScoreBreakdown[] = [];

  const wrScore = Math.round(lerp(m.winRate, 0.2, 0.6, 0, 20));
  breakdown.push({
    category: "win_rate",
    label: "Win Rate",
    score: wrScore,
    maxScore: 20,
    detail: `${Math.round(m.winRate * 100)}% win rate across ${m.totalTrades} trades`,
  });

  const rrScore = Math.round(lerp(m.avgRR, 0.5, 2.5, 0, 20));
  breakdown.push({
    category: "risk_reward",
    label: "Risk-to-Reward",
    score: rrScore,
    maxScore: 20,
    detail: `Average R:R of ${m.avgRR.toFixed(2)}:1`,
  });

  const pfScore = Math.round(lerp(m.profitFactor, 0.5, 2.0, 0, 15));
  breakdown.push({
    category: "profit_factor",
    label: "Profit Factor",
    score: pfScore,
    maxScore: 15,
    detail: `Profit factor of ${m.profitFactor.toFixed(2)}`,
  });

  const maxStreakPenalty = m.totalTrades >= 5
    ? Math.round(lerp(m.maxConsecutiveLosses, 6, 2, 0, 10))
    : 5;
  breakdown.push({
    category: "loss_streaks",
    label: "Loss Streak Control",
    score: maxStreakPenalty,
    maxScore: 10,
    detail: `Max consecutive losses: ${m.maxConsecutiveLosses}`,
  });

  const revengeScore = Math.round(lerp(m.revengeTradeRatio, 0.3, 0, 0, 10));
  breakdown.push({
    category: "revenge_trading",
    label: "Revenge Trading",
    score: revengeScore,
    maxScore: 10,
    detail: m.revengeTradeRatio > 0
      ? `${Math.round(m.revengeTradeRatio * 100)}% of trades may be revenge trades`
      : "No revenge trading patterns detected",
  });

  const sizingScore = Math.round(lerp(m.oversizingRatio, 0.3, 0, 0, 10));
  breakdown.push({
    category: "position_sizing",
    label: "Position Sizing",
    score: sizingScore,
    maxScore: 10,
    detail: m.oversizingRatio > 0
      ? `${Math.round(m.oversizingRatio * 100)}% of trades used outsized positions (>2x average)`
      : "Position sizing appears consistent",
  });

  let holdScore = 15;
  const earlyPenalty = Math.round(m.earlyExitRatio * 10);
  const latePenalty = Math.round(m.lateExitRatio * 10);
  holdScore = clamp(15 - earlyPenalty - latePenalty, 0, 15);
  const holdDetails: string[] = [];
  if (m.earlyExitRatio > 0.1) holdDetails.push(`${Math.round(m.earlyExitRatio * 100)}% early exits on winners`);
  if (m.lateExitRatio > 0.1) holdDetails.push(`${Math.round(m.lateExitRatio * 100)}% late exits on losers`);
  breakdown.push({
    category: "hold_discipline",
    label: "Hold Discipline",
    score: holdScore,
    maxScore: 15,
    detail: holdDetails.length > 0 ? holdDetails.join("; ") : "Hold times appear well managed",
  });

  const totalScore = clamp(breakdown.reduce((s, b) => s + b.score, 0), 0, 100);

  return {
    leakScore: totalScore,
    breakdown,
    metrics: m,
  };
}
