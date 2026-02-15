import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const reports = await prisma.leakReport.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: { upload: true },
  });

  const reportIds = reports.map((r) => r.uploadId);
  const tradeCounts = await prisma.trade.groupBy({
    by: ["uploadId"],
    where: { uploadId: { in: reportIds } },
    _count: { id: true },
  });
  const tradeCountMap = Object.fromEntries(tradeCounts.map((t) => [t.uploadId, t._count.id]));

  return NextResponse.json({
    reports: reports.map((r) => ({
      id: r.id,
      title: r.title,
      leakScore: r.leakScore,
      createdAt: r.createdAt.toISOString(),
      tradesCount: tradeCountMap[r.uploadId] || 0,
      isSample: r.upload?.isSample || false,
      sampleType: r.upload?.sampleType || null,
    })),
  });
}
