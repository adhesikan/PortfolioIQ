import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = req.nextUrl;
  const page = Math.max(1, parseInt(url.searchParams.get("page") || "1"));
  const perPage = Math.min(50, Math.max(5, parseInt(url.searchParams.get("perPage") || "10")));
  const sortBy = url.searchParams.get("sortBy") || "createdAt";
  const sortOrder = url.searchParams.get("sortOrder") === "asc" ? "asc" : "desc";
  const filterType = url.searchParams.get("type") || "all";
  const search = url.searchParams.get("search") || "";
  const scoreMin = url.searchParams.get("scoreMin") ? parseInt(url.searchParams.get("scoreMin")!) : undefined;
  const scoreMax = url.searchParams.get("scoreMax") ? parseInt(url.searchParams.get("scoreMax")!) : undefined;

  const where: any = { userId: user.id };

  if (filterType === "sample") {
    where.upload = { isSample: true };
  } else if (filterType === "uploaded") {
    where.upload = { isSample: false };
  }

  if (search) {
    where.title = { contains: search, mode: "insensitive" };
  }

  if (scoreMin !== undefined || scoreMax !== undefined) {
    where.leakScore = {};
    if (scoreMin !== undefined) where.leakScore.gte = scoreMin;
    if (scoreMax !== undefined) where.leakScore.lte = scoreMax;
  }

  const allowedSortFields: Record<string, any> = {
    createdAt: { createdAt: sortOrder },
    leakScore: { leakScore: sortOrder },
    title: { title: sortOrder },
  };
  const orderBy = allowedSortFields[sortBy] || { createdAt: "desc" };

  const [total, reports] = await Promise.all([
    prisma.leakReport.count({ where }),
    prisma.leakReport.findMany({
      where,
      orderBy,
      include: { upload: true },
      skip: (page - 1) * perPage,
      take: perPage,
    }),
  ]);

  const uploadIds = reports.map((r) => r.uploadId);
  const tradeCounts = await prisma.trade.groupBy({
    by: ["uploadId"],
    where: { uploadId: { in: uploadIds } },
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
    pagination: {
      page,
      perPage,
      total,
      totalPages: Math.ceil(total / perPage),
    },
  });
}
