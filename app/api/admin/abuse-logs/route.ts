import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const logs = await prisma.abuseLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: { user: { select: { email: true } } },
  });

  return NextResponse.json({
    logs: logs.map((l) => ({
      id: l.id,
      hashedIp: l.hashedIp,
      action: l.action,
      riskScore: l.riskScore,
      createdAt: l.createdAt.toISOString(),
      userEmail: l.user?.email ?? null,
    })),
  });
}
