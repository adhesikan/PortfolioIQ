import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const category = searchParams.get("category");
  const q = searchParams.get("q");
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const limit = Math.max(1, Math.min(100, parseInt(searchParams.get("limit") || "20", 10)));

  const where: any = { AND: [] as any[] };

  if (status) where.AND.push({ status });
  if (category) where.AND.push({ category });
  if (q) {
    where.AND.push({
      OR: [
        { userEmail: { contains: q, mode: "insensitive" } },
        { subject: { contains: q, mode: "insensitive" } },
      ],
    });
  }

  if (where.AND.length === 0) delete where.AND;

  const [tickets, total] = await Promise.all([
    prisma.supportTicket.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.supportTicket.count({ where }),
  ]);

  return NextResponse.json({
    tickets,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  });
}
