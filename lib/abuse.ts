import { prisma } from "./db";
import { hashIp } from "./auth";

export async function logAbuse(params: {
  userId?: string;
  ip: string;
  deviceId?: string;
  userAgent?: string;
  action: string;
}) {
  const hashedIp = hashIp(params.ip);

  const recentLogs = await prisma.abuseLog.count({
    where: {
      hashedIp,
      createdAt: { gte: new Date(Date.now() - 60 * 60 * 1000) },
    },
  });

  const riskScore = Math.min(recentLogs, 10);

  await prisma.abuseLog.create({
    data: {
      userId: params.userId,
      hashedIp,
      deviceId: params.deviceId,
      userAgent: params.userAgent,
      action: params.action,
      riskScore,
    },
  });

  return { riskScore, blocked: riskScore >= 8 };
}
