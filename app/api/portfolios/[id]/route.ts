import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

const DEMO_USER_ID = "demo-user";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const portfolio = await prisma.portfolio.findFirst({
      where: { 
        id: params.id,
        userId: DEMO_USER_ID
      },
      include: { holdings: true }
    });
    
    if (!portfolio) {
      return NextResponse.json({ error: "Portfolio not found" }, { status: 404 });
    }
    
    return NextResponse.json(portfolio);
  } catch (error) {
    console.error("Failed to fetch portfolio:", error);
    return NextResponse.json({ error: "Failed to fetch portfolio" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const existing = await prisma.portfolio.findFirst({
      where: { id: params.id, userId: DEMO_USER_ID }
    });
    
    if (!existing) {
      return NextResponse.json({ error: "Portfolio not found" }, { status: 404 });
    }

    const body = await request.json();
    const { name, holdings } = body;

    if (!name || typeof name !== "string") {
      return NextResponse.json({ error: "Portfolio name is required" }, { status: 400 });
    }

    if (!Array.isArray(holdings)) {
      return NextResponse.json({ error: "Holdings must be an array" }, { status: 400 });
    }

    await prisma.holding.deleteMany({
      where: { portfolioId: params.id }
    });

    const portfolio = await prisma.portfolio.update({
      where: { id: params.id },
      data: {
        name,
        holdings: {
          create: holdings.map((h: any) => ({
            ticker: String(h.ticker || "").toUpperCase(),
            name: h.name || null,
            assetClass: h.assetClass || "equity",
            sector: h.sector || null,
            region: h.region || null,
            quantity: Number(h.quantity) || 0,
            avgCost: h.avgCost ? Number(h.avgCost) : null,
            notes: h.notes || null,
            source: h.source || "manual"
          }))
        }
      },
      include: { holdings: true }
    });

    return NextResponse.json(portfolio);
  } catch (error) {
    console.error("Failed to update portfolio:", error);
    return NextResponse.json({ error: "Failed to update portfolio" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const existing = await prisma.portfolio.findFirst({
      where: { id: params.id, userId: DEMO_USER_ID }
    });
    
    if (!existing) {
      return NextResponse.json({ error: "Portfolio not found" }, { status: 404 });
    }

    await prisma.holding.deleteMany({
      where: { portfolioId: params.id }
    });
    
    await prisma.portfolio.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete portfolio:", error);
    return NextResponse.json({ error: "Failed to delete portfolio" }, { status: 500 });
  }
}
