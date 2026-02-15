import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const reports = await prisma.leakReport.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: { upload: { include: { trades: true } } },
  });

  return NextResponse.json({
    reports: reports.map((r) => ({
      id: r.id,
      leakScore: r.leakScore,
      createdAt: r.createdAt.toISOString(),
      tradesCount: r.upload.trades.length,
      isSample: r.upload.isSample || false,
      sampleType: r.upload.sampleType || null,
    })),
  });
}
