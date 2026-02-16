import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const reports = await prisma.leakReport.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      include: { upload: true },
      take: 10,
    });

    const uploadIds = reports.map((r) => r.uploadId);
    const tradeCounts = uploadIds.length > 0 ? await prisma.trade.groupBy({
      by: ["uploadId"],
      where: { uploadId: { in: uploadIds } },
      _count: { id: true },
    }) : [];
    const tradeCountMap = Object.fromEntries(tradeCounts.map((t) => [t.uploadId, t._count.id]));

    const latest = reports[0] || null;
    const previous = reports[1] || null;

    let latestDetail: any = null;
    if (latest) {
      latestDetail = {
        id: latest.id,
        title: latest.title,
        leakScore: latest.leakScore,
        createdAt: latest.createdAt.toISOString(),
        tradesCount: tradeCountMap[latest.uploadId] || 0,
        isSample: latest.upload?.isSample || false,
        sampleType: latest.upload?.sampleType || null,
        topLeaks: latest.topLeaks || [],
        keyStats: latest.keyStats || {},
        fixPlan: latest.fixPlan || [],
        fullReport: latest.fullReport || {},
      };
    }

    const scoreDelta = latest && previous ? latest.leakScore - previous.leakScore : null;

    let trend: "improving" | "stable" | "deteriorating" | null = null;
    if (reports.length >= 2) {
      const recent = reports.slice(0, Math.min(3, reports.length));
      const scores = recent.map((r) => r.leakScore);
      const avgDelta = (scores[0] - scores[scores.length - 1]) / (scores.length - 1);
      if (avgDelta > 3) trend = "improving";
      else if (avgDelta < -3) trend = "deteriorating";
      else trend = "stable";
    }

    return NextResponse.json({
      latest: latestDetail,
      scoreDelta,
      trend,
      totalReports: reports.length,
      recentReports: reports.map((r) => ({
        id: r.id,
        title: r.title,
        leakScore: r.leakScore,
        createdAt: r.createdAt.toISOString(),
        tradesCount: tradeCountMap[r.uploadId] || 0,
        isSample: r.upload?.isSample || false,
        sampleType: r.upload?.sampleType || null,
      })),
    });
  } catch (err) {
    console.error("Dashboard API error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
