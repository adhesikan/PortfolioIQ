import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

interface TopPage {
  path: string;
  views: number;
  unique_visitors: number;
}

interface DailyView {
  date: string;
  views: number;
}

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);
  const range = url.searchParams.get("range") || "7d";

  let since: Date;
  switch (range) {
    case "24h":
      since = new Date(Date.now() - 24 * 60 * 60 * 1000);
      break;
    case "30d":
      since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      break;
    case "7d":
    default:
      since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      break;
  }

  const [totalViews, uniqueVisitors, topPages, recentViews, dailyViews] = await Promise.all([
    prisma.pageView.count({
      where: { createdAt: { gte: since } },
    }),

    prisma.pageView.groupBy({
      by: ["hashedIp"],
      where: { createdAt: { gte: since } },
    }).then((r: { hashedIp: string }[]) => r.length),

    prisma.$queryRaw<TopPage[]>`
      SELECT path, COUNT(*)::int as views, COUNT(DISTINCT "hashedIp")::int as unique_visitors
      FROM "PageView"
      WHERE "createdAt" >= ${since}
      GROUP BY path
      ORDER BY views DESC
      LIMIT 20
    `,

    prisma.pageView.findMany({
      where: { createdAt: { gte: since } },
      orderBy: { createdAt: "desc" },
      take: 50,
      select: {
        id: true,
        path: true,
        hashedIp: true,
        userAgent: true,
        referrer: true,
        userId: true,
        deviceId: true,
        createdAt: true,
      },
    }),

    prisma.$queryRaw<DailyView[]>`
      SELECT DATE("createdAt") as date, COUNT(*)::int as views
      FROM "PageView"
      WHERE "createdAt" >= ${since}
      GROUP BY DATE("createdAt")
      ORDER BY date ASC
    `,
  ]);

  const userIds = recentViews
    .map((v: { userId: string | null }) => v.userId)
    .filter((id: string | null): id is string => !!id);
  
  let userMap: Record<string, string> = {};
  if (userIds.length > 0) {
    const uniqueIds: string[] = [...new Set(userIds)];
    const users = await prisma.user.findMany({
      where: { id: { in: uniqueIds } },
      select: { id: true, email: true },
    });
    userMap = Object.fromEntries(users.map((u: { id: string; email: string }) => [u.id, u.email]));
  }

  const recentViewsWithEmail = recentViews.map((v: { userId: string | null; [key: string]: unknown }) => ({
    ...v,
    userEmail: v.userId ? userMap[v.userId] || null : null,
  }));

  return NextResponse.json({
    totalViews,
    uniqueVisitors,
    topPages,
    recentViews: recentViewsWithEmail,
    dailyViews,
  });
}
