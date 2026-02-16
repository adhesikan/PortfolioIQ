import { prisma } from "@/lib/db";

export const FREE_REPORTS_LIFETIME_LIMIT = 3;
export const SAMPLE_REPORTS_PER_DAY_LIMIT = 5;
export const FREE_MAX_TRADES_PER_REPORT = 10;
export const PRO_MAX_TRADES_PER_REPORT = 500;

interface CanGenerateResult {
  allowed: boolean;
  reason: "OK" | "FREE_LIMIT_REACHED" | "NO_SUBSCRIPTION" | "ACCOUNT_DISABLED" | "SAMPLE_RATE_LIMIT";
  freeUsed: number;
  freeLimit: number;
  isSubscriber: boolean;
  message?: string;
}

export async function canGenerateReport(userId: string, isSample: boolean = false): Promise<CanGenerateResult> {
  const [usage, subscription] = await Promise.all([
    prisma.usageCounter.findUnique({ where: { userId } }),
    prisma.subscription.findUnique({ where: { userId } }),
  ]);

  const isSubscriber = subscription?.status === "active" || subscription?.status === "trialing";
  const freeUsed = usage?.freeReportsUsed ?? 0;

  if (isSample) {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todaySamples = await prisma.leakReport.findMany({
      where: {
        userId,
        createdAt: { gte: todayStart },
        upload: { isSample: true },
      },
      orderBy: { createdAt: "desc" },
      select: { createdAt: true },
      take: SAMPLE_REPORTS_PER_DAY_LIMIT,
    });

    if (todaySamples.length >= SAMPLE_REPORTS_PER_DAY_LIMIT) {
      const lastUsed = todaySamples[0].createdAt;
      const formattedDate = lastUsed.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
      const formattedTime = lastUsed.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
      return {
        allowed: false,
        reason: "SAMPLE_RATE_LIMIT",
        freeUsed,
        freeLimit: FREE_REPORTS_LIFETIME_LIMIT,
        isSubscriber,
        message: `You reached your daily sample report limit (${SAMPLE_REPORTS_PER_DAY_LIMIT}) on ${formattedDate} at ${formattedTime}. Please upload your own trade history or try again tomorrow.`,
      };
    }

    return { allowed: true, reason: "OK", freeUsed, freeLimit: FREE_REPORTS_LIFETIME_LIMIT, isSubscriber };
  }

  if (isSubscriber) {
    return { allowed: true, reason: "OK", freeUsed, freeLimit: FREE_REPORTS_LIFETIME_LIMIT, isSubscriber };
  }

  if (freeUsed >= FREE_REPORTS_LIFETIME_LIMIT) {
    return { allowed: false, reason: "FREE_LIMIT_REACHED", freeUsed, freeLimit: FREE_REPORTS_LIFETIME_LIMIT, isSubscriber };
  }

  return { allowed: true, reason: "OK", freeUsed, freeLimit: FREE_REPORTS_LIFETIME_LIMIT, isSubscriber };
}
