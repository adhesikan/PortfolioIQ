import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

// the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(request: NextRequest) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "OpenAI API key not configured" },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { image } = body;

    if (!image) {
      return NextResponse.json(
        { error: "No image provided" },
        { status: 400 }
      );
    }

    const response = await openai.chat.completions.create({
      model: "gpt-5",
      messages: [
        {
          role: "system",
          content: `You are a financial document parser. Extract investment holdings from brokerage statement screenshots.

IMPORTANT PRIVACY RULES:
- NEVER extract or include account numbers, SSN, or any personally identifiable information
- NEVER include names, addresses, or contact information
- ONLY extract: ticker symbols, security names, quantities, prices, and gains/losses

Extract the following data for each holding:
- ticker: The stock/ETF ticker symbol (e.g., AAPL, MSFT, VTI)
- name: The security name (optional)
- quantity: Number of shares held
- avgCost: Average cost basis per share (if shown)
- currentPrice: Current market price per share (if shown)
- gain: Dollar gain/loss (if shown)
- gainPercent: Percentage gain/loss (if shown)

Return a JSON object with this structure:
{
  "holdings": [
    {
      "ticker": "AAPL",
      "name": "Apple Inc",
      "quantity": 100,
      "avgCost": 150.00,
      "currentPrice": 175.00,
      "gain": 2500.00,
      "gainPercent": 16.67
    }
  ],
  "warnings": ["any issues or unclear data"],
  "source": "detected brokerage name if identifiable"
}

If you cannot parse the image or it doesn't contain holdings data, return:
{ "holdings": [], "warnings": ["reason"], "source": null }`
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Extract the investment holdings from this brokerage statement screenshot. Remember: DO NOT include any account numbers, personal information, or PII. Only extract ticker symbols, quantities, prices, and gains/losses."
            },
            {
              type: "image_url",
              image_url: {
                url: image.startsWith("data:") ? image : `data:image/jpeg;base64,${image}`
              }
            }
          ]
        }
      ],
      response_format: { type: "json_object" },
      max_completion_tokens: 4096
    });

    const content = response.choices[0].message.content;
    if (!content) {
      return NextResponse.json(
        { error: "No response from AI" },
        { status: 500 }
      );
    }

    const parsed = JSON.parse(content);
    
    const holdings = (parsed.holdings || []).map((h: any) => ({
      ticker: String(h.ticker || "").toUpperCase().trim(),
      name: h.name || null,
      quantity: Number(h.quantity) || 0,
      avgCost: h.avgCost ? Number(h.avgCost) : null,
      assetClass: "equity" as const,
      source: "image" as const
    })).filter((h: any) => h.ticker && h.quantity > 0);

    return NextResponse.json({
      holdings,
      warnings: parsed.warnings || [],
      source: parsed.source || "Unknown"
    });
  } catch (error) {
    console.error("Failed to parse image:", error);
    const message = error instanceof Error ? error.message : "Failed to parse image";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
