import { prisma } from "@/lib/db";

export const FREE_REPORTS_LIFETIME_LIMIT = 3;

interface CanGenerateResult {
  allowed: boolean;
  reason: "OK" | "FREE_LIMIT_REACHED" | "NO_SUBSCRIPTION" | "ACCOUNT_DISABLED";
  freeUsed: number;
  freeLimit: number;
  isSubscriber: boolean;
}

export async function canGenerateReport(userId: string): Promise<CanGenerateResult> {
  const [usage, subscription] = await Promise.all([
    prisma.usageCounter.findUnique({ where: { userId } }),
    prisma.subscription.findUnique({ where: { userId } }),
  ]);

  const isSubscriber = subscription?.status === "active";
  const freeUsed = usage?.freeReportsUsed ?? 0;

  if (isSubscriber) {
    return { allowed: true, reason: "OK", freeUsed, freeLimit: FREE_REPORTS_LIFETIME_LIMIT, isSubscriber };
  }

  if (freeUsed >= FREE_REPORTS_LIFETIME_LIMIT) {
    return { allowed: false, reason: "FREE_LIMIT_REACHED", freeUsed, freeLimit: FREE_REPORTS_LIFETIME_LIMIT, isSubscriber };
  }

  return { allowed: true, reason: "OK", freeUsed, freeLimit: FREE_REPORTS_LIFETIME_LIMIT, isSubscriber };
}
