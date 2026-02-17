import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
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
    }).then((r) => r.length),

    prisma.$queryRaw`
      SELECT path, COUNT(*)::int as views, COUNT(DISTINCT "hashedIp")::int as unique_visitors
      FROM "PageView"
      WHERE "createdAt" >= ${since}
      GROUP BY path
      ORDER BY views DESC
      LIMIT 20
    ` as Promise<Array<{ path: string; views: number; unique_visitors: number }>>,

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

    prisma.$queryRaw`
      SELECT DATE("createdAt") as date, COUNT(*)::int as views
      FROM "PageView"
      WHERE "createdAt" >= ${since}
      GROUP BY DATE("createdAt")
      ORDER BY date ASC
    ` as Promise<Array<{ date: string; views: number }>>,
  ]);

  const userIds = recentViews
    .map((v) => v.userId)
    .filter((id): id is string => !!id);
  
  let userMap: Record<string, string> = {};
  if (userIds.length > 0) {
    const users = await prisma.user.findMany({
      where: { id: { in: [...new Set(userIds)] } },
      select: { id: true, email: true },
    });
    userMap = Object.fromEntries(users.map((u) => [u.id, u.email]));
  }

  const recentViewsWithEmail = recentViews.map((v) => ({
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
