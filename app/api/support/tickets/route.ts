import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

const VALID_CATEGORIES = ["technical", "billing", "feature", "report_question", "other"];

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const tickets = await prisma.supportTicket.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      category: true,
      subject: true,
      message: true,
      status: true,
      adminResponse: true,
      respondedAt: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return NextResponse.json({ tickets });
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { category, subject, message, disclaimerAck } = body;

  if (!category || !VALID_CATEGORIES.includes(category)) {
    return NextResponse.json({ error: "Invalid category" }, { status: 400 });
  }

  const trimmedSubject = (subject || "").trim();
  const trimmedMessage = (message || "").trim();

  if (trimmedSubject.length < 3 || trimmedSubject.length > 120) {
    return NextResponse.json({ error: "Subject must be between 3 and 120 characters" }, { status: 400 });
  }

  if (trimmedMessage.length < 10 || trimmedMessage.length > 3000) {
    return NextResponse.json({ error: "Message must be between 10 and 3000 characters" }, { status: 400 });
  }

  if (!disclaimerAck) {
    return NextResponse.json({ error: "You must acknowledge the disclaimer" }, { status: 400 });
  }

  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  const recentCount = await prisma.supportTicket.count({
    where: { userId: user.id, createdAt: { gte: oneHourAgo } },
  });

  if (recentCount >= 5) {
    return NextResponse.json({ error: "Rate limit exceeded. Maximum 5 tickets per hour." }, { status: 429 });
  }

  const userAgent = req.headers.get("user-agent") || null;

  const ticket = await prisma.supportTicket.create({
    data: {
      userId: user.id,
      userEmail: user.email,
      userName: user.name,
      category,
      subject: trimmedSubject,
      message: trimmedMessage,
      meta: { userAgent },
    },
  });

  return NextResponse.json({ ok: true, ticketId: ticket.id });
}
