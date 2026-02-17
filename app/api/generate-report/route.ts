import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { canGenerateReport, FREE_REPORTS_LIFETIME_LIMIT, FREE_MAX_TRADES_PER_REPORT, PRO_MAX_TRADES_PER_REPORT } from "@/lib/usage";
import { logAbuse } from "@/lib/abuse";
import { calculateLeakScore } from "@/lib/leakScoring";
import OpenAI from "openai";

const openai = new OpenAI();

const SAMPLE_PROMPT_PREFIX = `IMPORTANT CONTEXT: The user is viewing an EXAMPLE dataset for demonstration purposes.
- Do not imply this reflects real user results or actual trading performance.
- Use compliance-safe language throughout. Do not promise outcomes or improvements.
- Avoid phrases like "you should buy/sell" or "you will improve returns."
- Frame all observations as educational examples of how the tool works.
- The report title should include "(Example)" to clearly mark it as demonstration data.
`;

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { uploadId, trades, selectedTradeIndices, timezone, uploadConsent } = await req.json();
    if (!uploadId || !trades?.length) {
      return NextResponse.json({ error: "Upload ID and trades are required" }, { status: 400 });
    }

    if (!uploadConsent) {
      return NextResponse.json({ error: "You must confirm the upload consent before generating a report." }, { status: 400 });
    }

    const upload = await prisma.upload.findFirst({ where: { id: uploadId, userId: user.id } });
    if (!upload) return NextResponse.json({ error: "Upload not found" }, { status: 404 });

    const isSampleReport = upload.isSample === true;

    const check = await canGenerateReport(user.id, isSampleReport);

    if (!check.allowed) {
      const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";
      const userAgent = req.headers.get("user-agent") || undefined;

      if (check.reason === "SAMPLE_RATE_LIMIT") {
        await logAbuse({ userId: user.id, userEmail: user.email, ip, userAgent, action: "SAMPLE_RATE_LIMIT_HIT" });
        return NextResponse.json({
          error: "SAMPLE_RATE_LIMIT",
          message: check.message,
        }, { status: 429 });
      }

      await logAbuse({ userId: user.id, userEmail: user.email, ip, userAgent, action: "FREE_LIMIT_REACHED" });
      return NextResponse.json({
        error: "FREE_LIMIT_REACHED",
        freeUsed: check.freeUsed,
        freeLimit: check.freeLimit,
        paywallUrl: "/pricing?reason=limit",
      }, { status: 402 });
    }

    const isFreeUser = !check.isSubscriber && !isSampleReport;
    const maxTrades = isFreeUser ? FREE_MAX_TRADES_PER_REPORT : PRO_MAX_TRADES_PER_REPORT;

    let tradesToAnalyze = trades;

    if (isFreeUser && trades.length > FREE_MAX_TRADES_PER_REPORT) {
      if (!selectedTradeIndices || !Array.isArray(selectedTradeIndices) || selectedTradeIndices.length !== FREE_MAX_TRADES_PER_REPORT) {
        return NextResponse.json({
          error: "FREE_TRADE_LIMIT_EXCEEDED",
          freeMaxTrades: FREE_MAX_TRADES_PER_REPORT,
          totalTrades: trades.length,
          selectedCount: selectedTradeIndices?.length ?? 0,
          message: `Free reports analyze exactly ${FREE_MAX_TRADES_PER_REPORT} trades. ${selectedTradeIndices?.length > FREE_MAX_TRADES_PER_REPORT ? "Too many selected." : `Upgrade to analyze all ${trades.length} trades, or select ${FREE_MAX_TRADES_PER_REPORT} trades to continue.`}`,
        }, { status: 409 });
      }

      const validIndices = selectedTradeIndices.every((idx: number) =>
        Number.isInteger(idx) && idx >= 0 && idx < trades.length
      );
      if (!validIndices) {
        return NextResponse.json({ error: "Invalid trade selection indices" }, { status: 400 });
      }

      tradesToAnalyze = selectedTradeIndices.map((idx: number) => trades[idx]);
    }

    if (!isFreeUser && tradesToAnalyze.length > maxTrades) {
      tradesToAnalyze = tradesToAnalyze.slice(0, maxTrades);
    }

    if (!isSampleReport) {
      await prisma.trade.createMany({
        data: tradesToAnalyze.map((t: any) => ({
          uploadId,
          ticker: t.ticker || "UNKNOWN",
          action: t.action || "BUY",
          quantity: t.quantity || 0,
          entryPrice: t.entryPrice ?? null,
          exitPrice: t.exitPrice ?? null,
          entryDate: t.entryDate ?? null,
          exitDate: t.exitDate ?? null,
          pnl: t.pnl ?? null,
          pnlPercent: t.pnlPercent ?? null,
          holdingDays: t.holdingDays ?? null,
          confidence: t.confidence ?? null,
        })),
      });
    }

    const indexedTrades = tradesToAnalyze.map((t: any, i: number) => ({ tradeIndex: i, ...t }));
    const tradesSummary = JSON.stringify(indexedTrades, null, 2);

    const systemPrompt = `${isSampleReport ? SAMPLE_PROMPT_PREFIX : ""}You are a trading performance analyst. Analyze trade data and generate a Leak Report.
Each trade has a "tradeIndex" field — use it to reference specific trades in leakDrivingTrades.
You MUST return ONLY valid JSON with this exact structure:
{
  "reportTitle": "${isSampleReport ? "Trading Leak Finder Report (Example)" : "Trading Leak Finder Report"}",
  "leakScore": 42,
  "topLeaks": [
    {
      "title": "Leak name",
      "severity": 82,
      "evidence": "Specific data-backed evidence",
      "meaning": "What this pattern means for their trading",
      "quickFix": "Non-directive practical next step to consider testing",
      "leakDrivingTrades": [
        {
          "tradeIndex": 0,
          "symbol": "AAPL",
          "openDate": "2024-01-15",
          "closeDate": "2024-01-16",
          "pnl": -250,
          "holdDays": 1,
          "notes": "Why this specific trade contributed to this leak"
        }
      ],
      "fixPlan": [
        {
          "rule": "A practice rule to consider testing",
          "howToApply": "Non-directive step-by-step suggestion (use 'consider', 'you might test', etc.)",
          "whyItHelps": "Educational reasoning for why this approach may help"
        }
      ]
    }
  ],
  "keyStats": {
    "totalTrades": 47,
    "winRate": 0.41,
    "avgRR": 0.8,
    "avgWin": 250,
    "avgLoss": -312,
    "biggestWin": 1200,
    "biggestLoss": -890,
    "avgHoldWinDays": 1.8,
    "avgHoldLossDays": 4.2,
    "profitFactor": 0.75
  },
  "behaviorPatterns": [
    "Pattern description with evidence"
  ],
  "fixPlan": [
    { "day": 1, "task": "Action item for day 1" },
    { "day": 2, "task": "Action item for day 2" },
    { "day": 3, "task": "Action item for day 3" },
    { "day": 4, "task": "Action item for day 4" },
    { "day": 5, "task": "Action item for day 5" },
    { "day": 6, "task": "Action item for day 6" },
    { "day": 7, "task": "Action item for day 7" }
  ],
  "riskChecklist": [
    { "item": "Risk control item", "status": "pass" },
    { "item": "Risk control item", "status": "fail" },
    { "item": "Risk control item", "status": "warning" }
  ]${isSampleReport ? `,
  "compliance": {
    "isSample": true,
    "disclaimerShort": "Example only — sample trade data for demonstration purposes. Not financial advice."
  }` : ""}
}
Rules:
- leakScore is 0-100 where lower means more leaks (worse)
- Identify exactly 3 top leaks
- For each leak, include 2-5 leakDrivingTrades — specific trades that contributed to this leak pattern. Use the tradeIndex from the input data.
- For each leak, include 1-3 fixPlan items with rule, howToApply, and whyItHelps fields
- leakDrivingTrades notes should explain WHY this particular trade demonstrates the leak (educational, not advice)
- Be compliance-safe: no promises, no buy/sell recommendations, no directive language
- Never use "you should", "you must", "always do X". Instead use "consider testing", "you might try", "one approach is"
- The quickFix field should be renamed conceptually to "Practical Next Steps" — write non-directive suggestions, not commands
- Do NOT give specific numerical thresholds as rules (e.g., "cap at 2%", "use 1.5 ATR"). Instead describe the concept and suggest the user determine their own parameters
- Focus on behavior and process, not specific stocks
- Use novice-friendly language
- All evidence must be data-backed from the actual trades provided
- The 7-day plan should be framed as a "Review & Practice Plan" — suggest review tasks, not commands
- Never imply guaranteed improvement or profit. Use "may help", "could support", "worth testing"${isSampleReport ? "\n- Remember: this is EXAMPLE data for demonstration. Frame all findings as educational examples." : ""}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      max_tokens: 6000,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Analyze these ${tradesToAnalyze.length} trades and generate a Leak Report:\n\n${tradesSummary}` }
      ]
    });

    const content = response.choices[0].message.content || "";
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Could not parse AI response");
    const report = JSON.parse(jsonMatch[0]);

    const scoring = calculateLeakScore(tradesToAnalyze);
    report.leakScore = scoring.leakScore;
    report.scoreBreakdown = scoring.breakdown;
    if (report.keyStats) {
      report.keyStats.totalTrades = scoring.metrics.totalTrades;
      report.keyStats.winRate = scoring.metrics.winRate;
      report.keyStats.avgRR = scoring.metrics.avgRR;
      report.keyStats.avgWin = scoring.metrics.avgWin;
      report.keyStats.avgLoss = scoring.metrics.avgLoss;
      report.keyStats.biggestWin = scoring.metrics.biggestWin;
      report.keyStats.biggestLoss = scoring.metrics.biggestLoss;
      report.keyStats.avgHoldWinDays = scoring.metrics.avgHoldWinDays;
      report.keyStats.avgHoldLossDays = scoring.metrics.avgHoldLossDays;
      report.keyStats.profitFactor = scoring.metrics.profitFactor;
    }

    const result = await prisma.$transaction(async (tx) => {
      if (!isSampleReport && !check.isSubscriber) {
        const currentUsage = await tx.usageCounter.findUnique({ where: { userId: user.id } });
        const freeUsed = currentUsage?.freeReportsUsed ?? 0;

        if (freeUsed >= FREE_REPORTS_LIFETIME_LIMIT) {
          throw new Error("FREE_LIMIT_REACHED");
        }
      }

      const now = new Date();
      const tz = timezone || "UTC";
      const dateStr = now.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: tz });
      const timeStr = now.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true, timeZone: tz });
      const reportTitle = `Leak Report — ${dateStr}, ${timeStr}`;

      const leakReport = await tx.leakReport.create({
        data: {
          userId: user.id,
          uploadId,
          title: reportTitle,
          leakScore: report.leakScore || 50,
          topLeaks: report.topLeaks || [],
          keyStats: report.keyStats || {},
          behaviorPatterns: report.behaviorPatterns || [],
          fixPlan: report.fixPlan || [],
          riskChecklist: report.riskChecklist || [],
          fullReport: report,
        },
      });

      await tx.upload.update({ where: { id: uploadId }, data: { status: "completed" } });

      if (isSampleReport) {
        await tx.usageCounter.upsert({
          where: { userId: user.id },
          create: { userId: user.id, freeReportsUsed: 0, totalReports: 1, lastReportAt: new Date() },
          update: { totalReports: { increment: 1 }, lastReportAt: new Date() },
        });
      } else if (!check.isSubscriber) {
        await tx.usageCounter.upsert({
          where: { userId: user.id },
          create: { userId: user.id, freeReportsUsed: 1, totalReports: 1, lastReportAt: new Date() },
          update: { freeReportsUsed: { increment: 1 }, totalReports: { increment: 1 }, lastReportAt: new Date() },
        });
      } else {
        await tx.usageCounter.upsert({
          where: { userId: user.id },
          create: { userId: user.id, freeReportsUsed: 0, totalReports: 1, lastReportAt: new Date() },
          update: { totalReports: { increment: 1 }, lastReportAt: new Date() },
        });
      }

      return leakReport;
    });

    if (isSampleReport) {
      const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";
      const userAgent = req.headers.get("user-agent") || undefined;
      await logAbuse({ userId: user.id, userEmail: user.email, ip, userAgent, action: "SAMPLE_REPORT_GENERATED" });
    }

    return NextResponse.json({
      reportId: result.id,
      report,
      tradesAnalyzed: tradesToAnalyze.length,
      totalTrades: trades.length,
    });
  } catch (error: any) {
    if (error.message === "FREE_LIMIT_REACHED") {
      return NextResponse.json({
        error: "FREE_LIMIT_REACHED",
        freeUsed: FREE_REPORTS_LIFETIME_LIMIT,
        freeLimit: FREE_REPORTS_LIFETIME_LIMIT,
        paywallUrl: "/pricing?reason=limit",
      }, { status: 402 });
    }
    console.error("Generate report error:", error);
    return NextResponse.json({ error: error.message || "Report generation failed" }, { status: 500 });
  }
}
