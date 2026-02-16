import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser, hashIp } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";
    const userAgent = req.headers.get("user-agent") || undefined;
    const hashedIp = hashIp(ip);

    await prisma.user.update({
      where: { id: user.id },
      data: { piiDisclaimerDismissedAt: new Date() },
    });

    await prisma.consentLog.create({
      data: {
        userId: user.id,
        email: user.email,
        hashedIp,
        consentType: "pii_disclaimer_dismiss",
        disclaimerAccepted: true,
        userAgent,
        details: {
          action: "dont_show_again",
          timestamp: new Date().toISOString(),
          source: "upload_pii_dialog",
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("PII dismiss error:", error);
    return NextResponse.json({ error: "Failed to save preference" }, { status: 500 });
  }
}
