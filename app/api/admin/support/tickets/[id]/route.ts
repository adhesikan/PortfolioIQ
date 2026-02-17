import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const ticket = await prisma.supportTicket.findUnique({
    where: { id: params.id },
    include: {
      user: {
        select: {
          email: true,
          name: true,
          role: true,
          createdAt: true,
          subscription: { select: { status: true } },
          _count: { select: { reports: true } },
        },
      },
    },
  });

  if (!ticket) return NextResponse.json({ error: "Ticket not found" }, { status: 404 });

  return NextResponse.json({ ticket });
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await getCurrentUser();
  if (!admin || admin.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const existing = await prisma.supportTicket.findUnique({ where: { id: params.id } });
  if (!existing) return NextResponse.json({ error: "Ticket not found" }, { status: 404 });

  const body = await req.json();
  const { status, adminResponse } = body;

  const data: any = {};
  if (status) data.status = status;
  if (adminResponse) {
    data.adminResponse = adminResponse;
    data.respondedAt = new Date();
    data.respondedByAdminId = admin.id;
  }

  const ticket = await prisma.supportTicket.update({
    where: { id: params.id },
    data,
  });

  return NextResponse.json({ ticket });
}
