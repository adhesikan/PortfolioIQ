import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  const usage = await prisma.usageCounter.findUnique({ where: { userId: user.id } });
  const subscription = await prisma.subscription.findUnique({ where: { userId: user.id } });

  return NextResponse.json({
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      sampleDisclaimerAcceptedAt: user.sampleDisclaimerAcceptedAt?.toISOString() || null,
      usage: usage ? { freeReportsUsed: usage.freeReportsUsed, totalReports: usage.totalReports } : null,
      subscription: subscription ? { status: subscription.status, currentPeriodEnd: subscription.currentPeriodEnd } : null,
    },
  });
}
