import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { hashPassword, createSession, hashIp } from "@/lib/auth";
import { logAbuse } from "@/lib/abuse";
import { z } from "zod";

const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, "Password must be at least 8 characters"),
  name: z.string().min(1).optional(),
  consent: z.boolean(),
});

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";
    const userAgent = req.headers.get("user-agent") || undefined;

    const body = await req.json();
    const { email, password, name, consent } = signupSchema.parse(body);

    if (!consent) {
      return NextResponse.json({ error: "You must agree to the Terms of Service and Privacy Policy." }, { status: 400 });
    }

    const abuseResult = await logAbuse({ ip, userAgent, action: "signup" });
    if (abuseResult.blocked) {
      return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "Email already registered" }, { status: 400 });
    }

    const passwordHash = await hashPassword(password);
    const user = await prisma.user.create({
      data: { email, passwordHash, name },
    });

    await prisma.usageCounter.create({
      data: { userId: user.id, freeReportsUsed: 0, totalReports: 0 },
    });

    await prisma.consentLog.create({
      data: {
        userId: user.id,
        email: user.email,
        hashedIp: hashIp(ip),
        consentType: "signup",
        disclaimerAccepted: true,
        privacyPolicyAccepted: true,
        userAgent,
        details: {
          timestamp: new Date().toISOString(),
          source: "signup_form",
        },
      },
    });

    await createSession(user.id);

    return NextResponse.json({ success: true, user: { id: user.id, email: user.email, name: user.name } });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
