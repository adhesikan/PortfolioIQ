import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

const DEMO_USER_ID = "demo-user";
const VALID_ASSET_CLASSES = ["equity", "etf", "crypto", "cash", "fixed-income", "other"];

async function getOrCreateDemoUser() {
  let user = await prisma.user.findUnique({ where: { id: DEMO_USER_ID } });
  if (!user) {
    user = await prisma.user.create({
      data: {
        id: DEMO_USER_ID,
        email: "demo@portfolioiq.app",
        name: "Demo User"
      }
    });
  }
  return user;
}

export async function GET() {
  try {
    await getOrCreateDemoUser();
    const portfolios = await prisma.portfolio.findMany({
      where: { userId: DEMO_USER_ID },
      include: { holdings: true },
      orderBy: { createdAt: "desc" }
    });
    return NextResponse.json(portfolios);
  } catch (error) {
    console.error("Failed to fetch portfolios:", error);
    return NextResponse.json({ error: "Failed to fetch portfolios" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await getOrCreateDemoUser();
    const body = await request.json();
    const { name, holdings } = body;

    if (!Array.isArray(holdings) || holdings.length === 0) {
      return NextResponse.json({ error: "At least one holding is required" }, { status: 400 });
    }

    const validatedHoldings = holdings.map((h: any) => {
      const ticker = String(h.ticker || "").toUpperCase().trim();
      const quantity = Number(h.quantity) || 0;
      const avgCost = h.avgCost ? Number(h.avgCost) : null;
      const assetClass = VALID_ASSET_CLASSES.includes(h.assetClass) ? h.assetClass : "equity";
      
      if (!ticker) throw new Error("Ticker is required for all holdings");
      if (quantity <= 0) throw new Error("Quantity must be positive");
      
      return {
        ticker,
        name: h.name || null,
        assetClass,
        sector: h.sector || null,
        region: h.region || null,
        quantity,
        avgCost,
        notes: h.notes || null,
        source: h.source || "manual"
      };
    });

    const portfolio = await prisma.portfolio.create({
      data: {
        name: String(name || "My Portfolio").trim(),
        userId: DEMO_USER_ID,
        holdings: {
          create: validatedHoldings
        }
      },
      include: { holdings: true }
    });

    return NextResponse.json(portfolio, { status: 201 });
  } catch (error) {
    console.error("Failed to create portfolio:", error);
    const message = error instanceof Error ? error.message : "Failed to create portfolio";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
