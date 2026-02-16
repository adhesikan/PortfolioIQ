import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getSampleTrades, getSampleDataset, SampleType, type SampleDataset } from "@/lib/sampleTrades";
import { canGenerateReport } from "@/lib/usage";
import { logAbuse } from "@/lib/abuse";
import { calculateLeakScore } from "@/lib/leakScoring";
import OpenAI from "openai";

const openai = new OpenAI();

const VALID_TYPES: SampleType[] = ["DAY_TRADER", "SWING_TRADER", "MESSY", "DISCIPLINED", "OPTIONS"];

const SAMPLE_SYSTEM_PROMPT = `IMPORTANT CONTEXT: The user is viewing an EXAMPLE dataset for demonstration purposes.
- Do not imply this reflects real user results or actual trading performance.
- Use compliance-safe language throughout. Do not promise outcomes or improvements.
- Avoid phrases like "you should buy/sell" or "you will improve returns."
- Frame all observations as educational examples of how the tool works.
- The report title should include "(Example)" to clearly mark it as demonstration data.

You are a trading performance analyst. Analyze trade data and generate a Leak Report.
Each trade has a "tradeIndex" field — use it to reference specific trades in leakDrivingTrades.
You MUST return ONLY valid JSON with this exact structure:
{
  "reportTitle": "Trading Leak Finder Report (Example)",
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
  ],
  "compliance": {
    "isSample": true,
    "disclaimerShort": "Example only — sample trade data for demonstration purposes. Not financial advice."
  }
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
- Never imply guaranteed improvement or profit. Use "may help", "could support", "worth testing"
- Remember: this is EXAMPLE data for demonstration. Frame all findings as educational examples.`;

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const { sampleType, disclaimerAccepted, timezone } = body;

    if (!sampleType || !VALID_TYPES.includes(sampleType)) {
      return NextResponse.json({ error: "Invalid sample type" }, { status: 400 });
    }

    if (!disclaimerAccepted) {
      return NextResponse.json({ error: "You must accept the disclaimer to continue." }, { status: 400 });
    }

    if (!user.sampleDisclaimerAcceptedAt) {
      await prisma.user.update({
        where: { id: user.id },
        data: { sampleDisclaimerAcceptedAt: new Date() },
      });
    }

    const check = await canGenerateReport(user.id, true);
    if (!check.allowed && check.reason === "SAMPLE_RATE_LIMIT") {
      return NextResponse.json({
        error: "SAMPLE_RATE_LIMIT",
        message: check.message,
      }, { status: 429 });
    }

    const cachedReport = await prisma.leakReport.findFirst({
      where: {
        upload: {
          isSample: true,
          sampleType,
        },
      },
      include: { upload: true },
      orderBy: { createdAt: "desc" },
    });

    if (cachedReport) {
      const trades = getSampleTrades(sampleType as SampleType);
      const dataset = getSampleDataset(sampleType as SampleType);
      const scoring = calculateLeakScore(trades);
      const now = new Date();
      const tz = timezone || "UTC";
      const dateStr = now.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: tz });
      const timeStr = now.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true, timeZone: tz });
      const sampleTitle = `${dataset.label} Sample — ${dateStr}, ${timeStr}`;

      const cachedFull = (cachedReport.fullReport as Record<string, any>) || {};
      cachedFull.leakScore = scoring.leakScore;
      cachedFull.scoreBreakdown = scoring.breakdown;
      if (cachedFull.keyStats) {
        cachedFull.keyStats.totalTrades = scoring.metrics.totalTrades;
        cachedFull.keyStats.winRate = scoring.metrics.winRate;
        cachedFull.keyStats.avgRR = scoring.metrics.avgRR;
        cachedFull.keyStats.profitFactor = scoring.metrics.profitFactor;
      }

      const upload = await prisma.upload.create({
        data: {
          userId: user.id,
          type: "sample",
          inputType: "SAMPLE",
          sampleType,
          isSample: true,
          fileName: `sample_${sampleType.toLowerCase()}.json`,
          status: "completed",
          extractedData: trades as any,
          confidence: 1.0,
        },
      });

      await prisma.trade.createMany({
        data: trades.map((t) => ({
          uploadId: upload.id,
          ticker: t.ticker,
          action: t.action,
          quantity: t.quantity,
          entryPrice: t.entryPrice,
          exitPrice: t.exitPrice,
          entryDate: t.entryDate,
          exitDate: t.exitDate,
          pnl: t.pnl,
          pnlPercent: t.pnlPercent,
          holdingDays: t.holdingDays,
          confidence: 1.0,
          notes: t.notes,
        })),
      });

      const report = await prisma.leakReport.create({
        data: {
          userId: user.id,
          uploadId: upload.id,
          title: sampleTitle,
          leakScore: scoring.leakScore,
          topLeaks: cachedReport.topLeaks as any,
          keyStats: (cachedFull.keyStats || (cachedReport.keyStats as any)) ?? undefined,
          behaviorPatterns: cachedReport.behaviorPatterns as any ?? undefined,
          fixPlan: cachedReport.fixPlan as any ?? undefined,
          riskChecklist: cachedReport.riskChecklist as any ?? undefined,
          fullReport: cachedFull,
        },
      });

      await prisma.usageCounter.upsert({
        where: { userId: user.id },
        create: { userId: user.id, freeReportsUsed: 0, totalReports: 1, lastReportAt: new Date() },
        update: { totalReports: { increment: 1 }, lastReportAt: new Date() },
      });

      const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";
      const userAgent = req.headers.get("user-agent") || undefined;
      await logAbuse({ userId: user.id, ip, userAgent, action: "SAMPLE_REPORT_CACHED" });

      return NextResponse.json({
        reportId: report.id,
        cached: true,
        tradesCount: trades.length,
      });
    }

    const trades = getSampleTrades(sampleType as SampleType);

    const upload = await prisma.upload.create({
      data: {
        userId: user.id,
        type: "sample",
        inputType: "SAMPLE",
        sampleType,
        isSample: true,
        fileName: `sample_${sampleType.toLowerCase()}.json`,
        status: "extracted",
        extractedData: trades as any,
        confidence: 1.0,
      },
    });

    await prisma.trade.createMany({
      data: trades.map((t) => ({
        uploadId: upload.id,
        ticker: t.ticker,
        action: t.action,
        quantity: t.quantity,
        entryPrice: t.entryPrice,
        exitPrice: t.exitPrice,
        entryDate: t.entryDate,
        exitDate: t.exitDate,
        pnl: t.pnl,
        pnlPercent: t.pnlPercent,
        holdingDays: t.holdingDays,
        confidence: 1.0,
        notes: t.notes,
      })),
    });

    const indexedTrades = trades.map((t, i) => ({ tradeIndex: i, ...t }));
    const tradesSummary = JSON.stringify(indexedTrades, null, 2);

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      max_tokens: 6000,
      messages: [
        { role: "system", content: SAMPLE_SYSTEM_PROMPT },
        { role: "user", content: `Analyze these ${trades.length} trades and generate a Leak Report:\n\n${tradesSummary}` },
      ],
    });

    const content = response.choices[0].message.content || "";
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Could not parse AI response");
    const reportData = JSON.parse(jsonMatch[0]);

    const scoring = calculateLeakScore(trades);
    reportData.leakScore = scoring.leakScore;
    reportData.scoreBreakdown = scoring.breakdown;
    if (reportData.keyStats) {
      reportData.keyStats.totalTrades = scoring.metrics.totalTrades;
      reportData.keyStats.winRate = scoring.metrics.winRate;
      reportData.keyStats.avgRR = scoring.metrics.avgRR;
      reportData.keyStats.avgWin = scoring.metrics.avgWin;
      reportData.keyStats.avgLoss = scoring.metrics.avgLoss;
      reportData.keyStats.biggestWin = scoring.metrics.biggestWin;
      reportData.keyStats.biggestLoss = scoring.metrics.biggestLoss;
      reportData.keyStats.avgHoldWinDays = scoring.metrics.avgHoldWinDays;
      reportData.keyStats.avgHoldLossDays = scoring.metrics.avgHoldLossDays;
      reportData.keyStats.profitFactor = scoring.metrics.profitFactor;
    }

    const dataset = getSampleDataset(sampleType as SampleType);
    const nowGen = new Date();
    const tzGen = timezone || "UTC";
    const dateStrGen = nowGen.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: tzGen });
    const timeStrGen = nowGen.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true, timeZone: tzGen });
    const genTitle = `${dataset.label} Sample — ${dateStrGen}, ${timeStrGen}`;

    const report = await prisma.leakReport.create({
      data: {
        userId: user.id,
        uploadId: upload.id,
        title: genTitle,
        leakScore: reportData.leakScore,
        topLeaks: reportData.topLeaks || [],
        keyStats: reportData.keyStats || {},
        behaviorPatterns: reportData.behaviorPatterns || [],
        fixPlan: reportData.fixPlan || [],
        riskChecklist: reportData.riskChecklist || [],
        fullReport: reportData,
      },
    });

    await prisma.upload.update({ where: { id: upload.id }, data: { status: "completed" } });

    await prisma.usageCounter.upsert({
      where: { userId: user.id },
      create: { userId: user.id, freeReportsUsed: 0, totalReports: 1, lastReportAt: new Date() },
      update: { totalReports: { increment: 1 }, lastReportAt: new Date() },
    });

    const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";
    const userAgent = req.headers.get("user-agent") || undefined;
    await logAbuse({ userId: user.id, ip, userAgent, action: "SAMPLE_REPORT_GENERATED" });

    return NextResponse.json({
      reportId: report.id,
      cached: false,
      tradesCount: trades.length,
    });
  } catch (error: any) {
    console.error("Sample report error:", error);
    return NextResponse.json({ error: error.message || "Failed to create sample report" }, { status: 500 });
  }
}
