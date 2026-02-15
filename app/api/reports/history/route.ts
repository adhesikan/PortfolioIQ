import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const subscription = await prisma.subscription.findUnique({ where: { userId: user.id } });
  const isPro = subscription?.status === "active" || subscription?.status === "trialing";

  if (!isPro) {
    return NextResponse.json({ error: "Pro subscription required" }, { status: 403 });
  }

  const reports = await prisma.leakReport.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "asc" },
    include: { upload: true },
  });

  const uploadIds = reports.map((r) => r.uploadId);
  let tradeCountMap: Record<string, number> = {};

  if (uploadIds.length > 0) {
    const tradeCounts = await prisma.trade.groupBy({
      by: ["uploadId"],
      where: { uploadId: { in: uploadIds } },
      _count: { id: true },
    });
    tradeCountMap = Object.fromEntries(tradeCounts.map((t) => [t.uploadId, t._count.id]));
  }

  const history = reports.map((r) => {
    const topLeaks = r.topLeaks as any[];
    const keyStats = r.keyStats as Record<string, any> | null;
    return {
      id: r.id,
      title: r.title,
      leakScore: r.leakScore,
      createdAt: r.createdAt.toISOString(),
      isSample: (r.upload as any)?.isSample || false,
      sampleType: (r.upload as any)?.sampleType || null,
      tradesCount: tradeCountMap[r.uploadId] || 0,
      leakTitles: topLeaks ? topLeaks.map((l: any) => l.title).filter(Boolean) : [],
      winRate: keyStats?.winRate != null ? Math.round(keyStats.winRate * 100) : null,
      profitFactor: keyStats?.profitFactor != null ? parseFloat(keyStats.profitFactor.toFixed(2)) : null,
      avgRR: keyStats?.avgRR != null ? parseFloat(keyStats.avgRR.toFixed(1)) : null,
    };
  });

  const nonSampleHistory = history.filter((r) => !r.isSample);

  const allLeaks: Record<string, number[]> = {};
  nonSampleHistory.forEach((r, idx) => {
    r.leakTitles.forEach((title: string) => {
      if (!allLeaks[title]) allLeaks[title] = [];
      allLeaks[title].push(idx);
    });
  });

  const recurring = Object.entries(allLeaks)
    .filter(([_, indices]) => indices.length >= 2)
    .map(([title, indices]) => ({
      title,
      occurrences: indices.length,
      firstSeen: nonSampleHistory[indices[0]]?.createdAt,
      lastSeen: nonSampleHistory[indices[indices.length - 1]]?.createdAt,
      resolved: indices[indices.length - 1] < nonSampleHistory.length - 1,
    }))
    .sort((a, b) => b.occurrences - a.occurrences);

  return NextResponse.json({
    history,
    recurringLeaks: recurring,
    totalReports: history.length,
  });
}
