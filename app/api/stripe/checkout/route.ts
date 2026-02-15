import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser, hashIp } from "@/lib/auth";
import { prisma } from "@/lib/db";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", { apiVersion: "2024-06-20" as any });

function extractIp(header: string | null): string {
  if (!header) return "";
  return header.split(",")[0].trim();
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const { disclaimerAccepted, privacyPolicyAccepted, recurringPaymentAccepted } = body;

    if (!disclaimerAccepted || !privacyPolicyAccepted || !recurringPaymentAccepted) {
      return NextResponse.json(
        { error: "You must accept all terms before proceeding." },
        { status: 400 }
      );
    }

    const rawIp = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "";
    const ip = extractIp(rawIp) || "no-ip";
    const hashedIp = hashIp(ip);

    await prisma.consentLog.create({
      data: {
        userId: user.id,
        email: user.email,
        hashedIp,
        consentType: "stripe_checkout_pro",
        disclaimerAccepted: true,
        privacyPolicyAccepted: true,
        recurringPaymentAccepted: true,
        userAgent: req.headers.get("user-agent") || null,
        details: {
          plan: "Pro",
          amount: "$29/month",
          timestamp: new Date().toISOString(),
        },
      },
    });

    let subscription = await prisma.subscription.findUnique({ where: { userId: user.id } });
    let customerId = subscription?.stripeCustomerId;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { userId: user.id },
      });
      customerId = customer.id;

      if (subscription) {
        await prisma.subscription.update({
          where: { userId: user.id },
          data: { stripeCustomerId: customerId },
        });
      } else {
        await prisma.subscription.create({
          data: { userId: user.id, stripeCustomerId: customerId },
        });
      }
    }

    const baseUrl = process.env.APP_BASE_URL || `https://${process.env.REPLIT_DEV_DOMAIN}` || "http://localhost:5000";

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      line_items: [{ price: process.env.STRIPE_PRO_PRICE_ID, quantity: 1 }],
      success_url: `${baseUrl}/dashboard?upgraded=true`,
      cancel_url: `${baseUrl}/pricing`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error("Stripe checkout error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
