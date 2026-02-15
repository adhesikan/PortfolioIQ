import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  const admin = await getCurrentUser();
  if (!admin || admin.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { to, subject, body } = await req.json();

  let whereClause: any = {};
  if (to === "free") {
    whereClause = { subscription: null };
  } else if (to === "paid") {
    whereClause = { subscription: { status: "active" } };
  }

  const users = await prisma.user.findMany({
    where: whereClause,
    select: { email: true },
  });

  if (process.env.SENDGRID_API_KEY) {
    const sgMail = require("@sendgrid/mail");
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);

    const fromEmail = process.env.SENDGRID_FROM_EMAIL || "noreply@portfolioiq.pro";

    let sent = 0;
    for (const u of users) {
      try {
        await sgMail.send({ to: u.email, from: fromEmail, subject, text: body, html: body.replace(/\n/g, "<br>") });
        sent++;
      } catch (err) {
        console.error(`Failed to send to ${u.email}:`, err);
      }
    }

    await prisma.adminAuditLog.create({
      data: { adminId: admin.id, action: `email_broadcast`, details: { to, subject, recipientCount: sent } },
    });

    return NextResponse.json({ success: true, count: sent });
  }

  await prisma.adminAuditLog.create({
    data: { adminId: admin.id, action: `email_broadcast_simulated`, details: { to, subject, recipientCount: users.length } },
  });

  return NextResponse.json({ success: true, count: users.length, note: "SendGrid not configured - emails simulated" });
}
