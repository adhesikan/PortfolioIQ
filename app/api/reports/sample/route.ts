import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getSampleTrades, SampleType } from "@/lib/sampleTrades";

const VALID_TYPES: SampleType[] = ["DAY_TRADER", "SWING_TRADER", "MESSY", "DISCIPLINED", "OPTIONS"];

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const { sampleType, disclaimerAccepted } = body;

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

    await prisma.abuseLog.create({
      data: {
        userId: user.id,
        hashedIp: "sample",
        action: "SAMPLE_REPORT_CREATED",
        riskScore: 0,
      },
    });

    return NextResponse.json({ uploadId: upload.id, tradesCount: trades.length });
  } catch (error: any) {
    console.error("Sample report error:", error);
    return NextResponse.json({ error: error.message || "Failed to create sample data" }, { status: 500 });
  }
}
