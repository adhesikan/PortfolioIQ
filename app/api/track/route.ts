import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { hashIp } from "@/lib/auth";

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { path, referrer, deviceId } = body;

    if (!path || typeof path !== "string" || path.length > 500) {
      return NextResponse.json({ ok: true });
    }

    const forwarded = req.headers.get("x-forwarded-for");
    const ip = forwarded?.split(",")[0]?.trim() || "unknown";
    const hashedIp = hashIp(ip);

    const now = Date.now();
    const limit = rateLimitMap.get(hashedIp);
    if (limit && limit.resetAt > now) {
      if (limit.count >= 60) {
        return NextResponse.json({ ok: true });
      }
      limit.count++;
    } else {
      rateLimitMap.set(hashedIp, { count: 1, resetAt: now + 60_000 });
    }

    if (rateLimitMap.size > 10000) {
      const entries = Array.from(rateLimitMap.entries());
      for (const [key, val] of entries) {
        if (val.resetAt <= now) rateLimitMap.delete(key);
      }
    }

    const userAgent = req.headers.get("user-agent") || undefined;

    let userId: string | undefined;
    const sessionToken = req.cookies.get("session_token")?.value;
    if (sessionToken) {
      try {
        const session = await prisma.session.findUnique({
          where: { token: sessionToken },
          select: { userId: true, expiresAt: true },
        });
        if (session && session.expiresAt > new Date()) {
          userId = session.userId;
        }
      } catch {}
    }

    const normalizedPath = path.split("?")[0].split("#")[0].substring(0, 500);

    await prisma.pageView.create({
      data: {
        path: normalizedPath,
        hashedIp,
        userAgent: userAgent?.substring(0, 500),
        referrer: typeof referrer === "string" ? referrer.substring(0, 500) : null,
        userId: userId || null,
        deviceId: typeof deviceId === "string" ? deviceId.substring(0, 100) : null,
      },
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: true });
  }
}
