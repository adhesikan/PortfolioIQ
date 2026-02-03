import { z } from "zod";
import { Holding } from "@/lib/types";

const holdingSchema = z.object({
  ticker: z.string().min(1).max(10),
  quantity: z.number(),
  avgCost: z.number().nullable().optional(),
  lastPrice: z.number().nullable().optional(),
  value: z.number().nullable().optional(),
  currency: z.string().optional(),
  confidence: z.number().min(0).max(1)
});

const extractionSchema = z.object({
  holdings: z.array(holdingSchema),
  warnings: z.array(z.string()).default([]),
  overallConfidence: z.number().min(0).max(1)
});

export type ImageExtractionResult = z.infer<typeof extractionSchema>;

const basePrompt = `You are a meticulous portfolio table parser. Extract holdings from the image into strict JSON.
Return JSON only with fields: holdings (array), warnings (array), overallConfidence (0-1).
Each holding must include ticker, quantity, avgCost, lastPrice, value, currency, confidence.
Normalize tickers to uppercase. If a field is missing use null. Do not include totals or summary rows.`;

const parseOpenAIResponse = (text: string): ImageExtractionResult => {
  const cleaned = text.trim().replace(/```json|```/g, "");
  const json = JSON.parse(cleaned);
  return extractionSchema.parse(json);
};

export const extractHoldingsFromImages = async (
  imageUrls: string[],
  brokerPreset: string | null
): Promise<ImageExtractionResult> => {
  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "gpt-4.1-mini",
      input: [
        {
          role: "system",
          content: basePrompt
        },
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: `Broker preset: ${brokerPreset ?? "Other"}. Extract holdings table.`
            },
            ...imageUrls.map((url) => ({
              type: "input_image",
              image_url: url
            }))
          ]
        }
      ]
    })
  });

  const data = await response.json();
  const outputText = data.output?.[0]?.content?.[0]?.text ?? "{}";
  const extracted = parseOpenAIResponse(outputText);

  if (extracted.overallConfidence < 0.65) {
    return fallbackOcrExtraction(imageUrls, brokerPreset, extracted);
  }

  return extracted;
};

const fallbackOcrExtraction = async (
  imageUrls: string[],
  brokerPreset: string | null,
  baseResult: ImageExtractionResult
): Promise<ImageExtractionResult> => {
  const ocrText = imageUrls.map((url) => `OCR placeholder for ${url}`).join("\n");

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "gpt-4.1-mini",
      input: [
        {
          role: "system",
          content: `${basePrompt} Use the OCR text instead of an image.`
        },
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: `Broker preset: ${brokerPreset ?? "Other"}. OCR TEXT:\n${ocrText}`
            }
          ]
        }
      ]
    })
  });

  const data = await response.json();
  const outputText = data.output?.[0]?.content?.[0]?.text ?? "{}";
  const extracted = parseOpenAIResponse(outputText);

  return {
    ...extracted,
    warnings: [...baseResult.warnings, ...extracted.warnings, "Vision confidence low; OCR fallback used."]
  };
};

export const validateExtraction = (result: ImageExtractionResult) => {
  const sanitized: Holding[] = result.holdings.map((holding) => ({
    ticker: holding.ticker.toUpperCase(),
    quantity: Number(holding.quantity),
    avgCost: holding.avgCost ?? null,
    lastPrice: holding.lastPrice ?? null,
    value: holding.value ?? null,
    assetClass: "equity",
    source: "image",
    confidence: holding.confidence
  }));

  return {
    holdings: sanitized,
    warnings: result.warnings,
    overallConfidence: result.overallConfidence
  };
};
