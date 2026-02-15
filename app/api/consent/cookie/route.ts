import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { hashIp, getSession } from "@/lib/auth";
import { z } from "zod";

const consentSchema = z.object({
  accepted: z.boolean(),
});

async function getLocationFromIp(ip: string): Promise<string | null> {
  if (!ip || ip === "unknown" || ip === "127.0.0.1" || ip === "::1") return null;
  try {
    const cleanIp = ip.split(",")[0].trim();
    const res = await fetch(`https://ipapi.co/${cleanIp}/json/`, { signal: AbortSignal.timeout(3000) });
    if (res.ok) {
      const data = await res.json();
      if (data.city && data.country_name) {
        return [data.city, data.region, data.country_name].filter(Boolean).join(", ");
      }
    }
  } catch {}
  return null;
}

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";
    const userAgent = req.headers.get("user-agent") || undefined;
    const hashedIp = hashIp(ip);

    const body = await req.json();
    const { accepted } = consentSchema.parse(body);

    let userId: string | undefined;
    let email: string | undefined;
    try {
      const session = await getSession();
      if (session) {
        userId = session.user.id;
        email = session.user.email;
      }
    } catch {}

    const location = accepted ? await getLocationFromIp(ip) : null;

    await prisma.consentLog.create({
      data: {
        userId: userId || null,
        email: email || null,
        hashedIp,
        consentType: "cookie",
        disclaimerAccepted: accepted,
        userAgent,
        location,
        details: {
          accepted,
          timestamp: new Date().toISOString(),
          source: "cookie_banner",
        },
      },
    });

    const response = NextResponse.json({ success: true });
    response.cookies.set("piq_cookie_consent", accepted ? "accepted" : "declined", {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 365 * 24 * 60 * 60,
      path: "/",
    });

    return response;
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid consent data" }, { status: 400 });
    }
    console.error("Cookie consent error:", error);
    return NextResponse.json({ error: "Failed to log consent" }, { status: 500 });
  }
}
