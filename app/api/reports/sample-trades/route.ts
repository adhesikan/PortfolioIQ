import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const uploadId = req.nextUrl.searchParams.get("uploadId");
    if (!uploadId) return NextResponse.json({ error: "Missing uploadId" }, { status: 400 });

    const upload = await prisma.upload.findFirst({
      where: { id: uploadId, userId: user.id },
      include: { trades: true },
    });

    if (!upload) return NextResponse.json({ error: "Upload not found" }, { status: 404 });

    return NextResponse.json({
      trades: upload.trades.map((t) => ({
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
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
