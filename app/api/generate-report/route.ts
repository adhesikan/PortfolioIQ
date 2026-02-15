import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import OpenAI from "openai";

const openai = new OpenAI();

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const usage = await prisma.usageCounter.findUnique({ where: { userId: user.id } });
    const subscription = await prisma.subscription.findUnique({ where: { userId: user.id } });
    const isPro = subscription?.status === "active";

    if (!isPro && (usage?.freeReportsUsed ?? 0) >= 10) {
      return NextResponse.json({ error: "Free report limit reached. Please upgrade to Pro." }, { status: 403 });
    }

    const { uploadId, trades } = await req.json();
    if (!uploadId || !trades?.length) {
      return NextResponse.json({ error: "Upload ID and trades are required" }, { status: 400 });
    }

    const upload = await prisma.upload.findFirst({ where: { id: uploadId, userId: user.id } });
    if (!upload) return NextResponse.json({ error: "Upload not found" }, { status: 404 });

    await prisma.trade.createMany({
      data: trades.map((t: any) => ({
        uploadId,
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
        confidence: t.confidence,
      })),
    });

    const tradesSummary = JSON.stringify(trades, null, 2);

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      max_tokens: 4000,
      messages: [
        {
          role: "system",
          content: `You are a trading performance analyst. Analyze trade data and generate a Leak Report.
You MUST return ONLY valid JSON with this exact structure:
{
  "leakScore": 42,
  "topLeaks": [
    {
      "title": "Leak name",
      "severity": 82,
      "evidence": "Specific data-backed evidence",
      "meaning": "What this pattern means for their trading",
      "quickFix": "Actionable fix they can implement today"
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
  ]
}
Rules:
- leakScore is 0-100 where lower means more leaks (worse)
- Identify exactly 3 top leaks
- Be compliance-safe: no promises, no buy/sell recommendations
- Focus on behavior and process, not specific stocks
- Use novice-friendly language
- All evidence must be data-backed from the actual trades provided
- The fix plan should be practical and progressive`
        },
        {
          role: "user",
          content: `Analyze these trades and generate a Leak Report:\n\n${tradesSummary}`
        }
      ]
    });

    const content = response.choices[0].message.content || "";
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Could not parse AI response");
    const report = JSON.parse(jsonMatch[0]);

    const leakReport = await prisma.leakReport.create({
      data: {
        userId: user.id,
        uploadId,
        leakScore: report.leakScore || 50,
        topLeaks: report.topLeaks || [],
        keyStats: report.keyStats || {},
        behaviorPatterns: report.behaviorPatterns || [],
        fixPlan: report.fixPlan || [],
        riskChecklist: report.riskChecklist || [],
        fullReport: report,
      },
    });

    await prisma.upload.update({ where: { id: uploadId }, data: { status: "completed" } });

    await prisma.usageCounter.upsert({
      where: { userId: user.id },
      create: { userId: user.id, freeReportsUsed: 1, totalReports: 1, lastReportAt: new Date() },
      update: { freeReportsUsed: { increment: 1 }, totalReports: { increment: 1 }, lastReportAt: new Date() },
    });

    return NextResponse.json({ reportId: leakReport.id, report });
  } catch (error: any) {
    console.error("Generate report error:", error);
    return NextResponse.json({ error: error.message || "Report generation failed" }, { status: 500 });
  }
}
