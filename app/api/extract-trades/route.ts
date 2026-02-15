import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { logAbuse } from "@/lib/abuse";
import OpenAI from "openai";

const openai = new OpenAI();

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";
    await logAbuse({ userId: user.id, ip, userAgent: req.headers.get("user-agent") || undefined, action: "extract_trades" });

    const formData = await req.formData();
    const file = formData.get("file") as File;
    const type = (formData.get("type") as string) || "screenshot";

    if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });

    let trades: any[] = [];

    if (type === "csv") {
      const text = await file.text();
      trades = parseCSVTrades(text);
    } else {
      const bytes = await file.arrayBuffer();
      const base64 = Buffer.from(bytes).toString("base64");
      const mimeType = file.type || "image/png";

      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        max_tokens: 4000,
        messages: [
          {
            role: "system",
            content: `You are a trade data extraction specialist. Extract structured trade data from brokerage screenshots.
Return ONLY valid JSON with this exact structure:
{
  "trades": [
    {
      "ticker": "AAPL",
      "action": "BUY",
      "quantity": 100,
      "entryPrice": 150.50,
      "exitPrice": 155.00,
      "entryDate": "2024-01-15",
      "exitDate": "2024-01-20",
      "pnl": 450.00,
      "pnlPercent": 2.99,
      "holdingDays": 5,
      "confidence": 0.95
    }
  ]
}
Rules:
- action must be BUY, SELL, SHORT, or COVER. If not visible, infer from context (positive P&L with long position = BUY, etc). Default to "BUY" if truly unknown.
- ticker, action, and quantity must never be null
- Set unknown optional fields (entryPrice, exitPrice, entryDate, exitDate, pnl, pnlPercent, holdingDays) to null
- Assign confidence 0.0-1.0 per row based on how clearly you can read the data
- Never fabricate data that isn't visible in the image
- Calculate pnl and pnlPercent if entry and exit prices are available
- Calculate holdingDays if dates are available`
          },
          {
            role: "user",
            content: [
              { type: "text", text: "Extract all trades from this brokerage screenshot." },
              { type: "image_url", image_url: { url: `data:${mimeType};base64,${base64}` } }
            ]
          }
        ]
      });

      const content = response.choices[0].message.content || "";
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("Could not parse AI response");
      const parsed = JSON.parse(jsonMatch[0]);
      trades = parsed.trades || [];
    }

    const upload = await prisma.upload.create({
      data: {
        userId: user.id,
        type,
        fileName: file.name,
        status: "extracted",
        extractedData: trades as any,
        confidence: trades.length > 0 ? trades.reduce((s: number, t: any) => s + (t.confidence || 0), 0) / trades.length : 0,
      },
    });

    return NextResponse.json({ trades, uploadId: upload.id });
  } catch (error: any) {
    console.error("Extract trades error:", error);
    return NextResponse.json({ error: error.message || "Extraction failed" }, { status: 500 });
  }
}

function parseCSVTrades(csv: string): any[] {
  const lines = csv.split("\n").map((l) => l.trim()).filter(Boolean);
  if (lines.length < 2) return [];

  const headers = lines[0].toLowerCase().split(",").map((h) => h.trim().replace(/"/g, ""));
  const trades: any[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    if (values.length < 2) continue;

    const row: Record<string, string> = {};
    headers.forEach((h, idx) => { row[h] = values[idx] || ""; });

    const ticker = row["ticker"] || row["symbol"] || row["stock"] || "";
    const action = (row["action"] || row["side"] || row["type"] || "BUY").toUpperCase();
    const quantity = parseFloat(row["quantity"] || row["qty"] || row["shares"] || "0");
    const entryPrice = parseFloat(row["entry"] || row["entry_price"] || row["entryprice"] || row["buy_price"] || "") || null;
    const exitPrice = parseFloat(row["exit"] || row["exit_price"] || row["exitprice"] || row["sell_price"] || "") || null;
    const pnl = parseFloat(row["pnl"] || row["profit"] || row["gain"] || row["p&l"] || "") || null;
    const pnlPercent = parseFloat(row["pnl%"] || row["pnl_percent"] || row["return"] || "") || null;

    if (ticker) {
      trades.push({
        ticker: ticker.toUpperCase(),
        action,
        quantity: quantity || 1,
        entryPrice,
        exitPrice,
        entryDate: row["entry_date"] || row["entrydate"] || row["date"] || null,
        exitDate: row["exit_date"] || row["exitdate"] || row["close_date"] || null,
        pnl,
        pnlPercent,
        holdingDays: parseInt(row["holding_days"] || row["days"] || "") || null,
        confidence: 0.9,
      });
    }
  }

  return trades;
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;
  for (const char of line) {
    if (char === '"') { inQuotes = !inQuotes; continue; }
    if (char === "," && !inQuotes) { result.push(current.trim()); current = ""; continue; }
    current += char;
  }
  result.push(current.trim());
  return result;
}
