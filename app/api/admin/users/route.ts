import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const users = await prisma.user.findMany({
    include: { usageCounter: true, subscription: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({
    users: users.map((u) => ({
      id: u.id,
      email: u.email,
      name: u.name,
      role: u.role,
      isDisabled: u.isDisabled,
      createdAt: u.createdAt.toISOString(),
      freeReportsUsed: u.usageCounter?.freeReportsUsed ?? 0,
      totalReports: u.usageCounter?.totalReports ?? 0,
      subscriptionStatus: u.subscription?.status ?? null,
    })),
  });
}

export async function PATCH(req: NextRequest) {
  const admin = await getCurrentUser();
  if (!admin || admin.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { userId, action } = await req.json();

  if (action === "disable") {
    await prisma.user.update({ where: { id: userId }, data: { isDisabled: true } });
  } else if (action === "enable") {
    await prisma.user.update({ where: { id: userId }, data: { isDisabled: false } });
  } else if (action === "resetReports") {
    const current = await prisma.usageCounter.findUnique({ where: { userId } });
    await prisma.usageCounter.update({ where: { userId }, data: { freeReportsUsed: 0 } });
    await prisma.adminAuditLog.create({
      data: {
        adminId: admin.id,
        action: "reset_free_reports",
        targetId: userId,
        details: { previousCount: current?.freeReportsUsed ?? 0, resetTo: 0 },
      },
    });
  } else if (action === "makeAdmin") {
    await prisma.user.update({ where: { id: userId }, data: { role: "ADMIN" } });
  } else if (action === "makeUser") {
    await prisma.user.update({ where: { id: userId }, data: { role: "USER" } });
  }

  await prisma.adminAuditLog.create({
    data: { adminId: admin.id, action: `${action}:${userId}`, targetId: userId },
  });

  return NextResponse.json({ success: true });
}
