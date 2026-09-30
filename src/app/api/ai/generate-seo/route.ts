import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

export async function POST(req: NextRequest) {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) {
    return NextResponse.json(
      { error: "ANTHROPIC_API_KEY is not set in the server environment." },
      { status: 503 },
    );
  }

  const { pageLabel, pageKey, siteName } = (await req.json()) as {
    pageLabel: string;
    pageKey: string;
    siteName?: string;
  };

  const client = new Anthropic({ apiKey: key });

  const prompt = `You are an expert SEO copywriter for a wedding photography studio.

Site: ${siteName || "Blossom Weddings — Wedding Photography & Films"}
Page: ${pageLabel} (key: "${pageKey}")

Write optimised SEO metadata for this page. Return ONLY a JSON object with these exact keys and no extra text:
{
  "metaTitle": "60 characters max — compelling, keyword-rich page title",
  "metaDescription": "155 characters max — persuasive summary with a CTA",
  "metaKeywords": "8–12 comma-separated keywords relevant to this page"
}`;

  const message = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 512,
    messages: [{ role: "user", content: prompt }],
  });

  const text = (message.content[0] as { type: string; text: string }).text.trim();

  // Extract the JSON block in case Claude wraps it in markdown
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) {
    return NextResponse.json({ error: "Model returned unexpected format." }, { status: 502 });
  }

  return NextResponse.json(JSON.parse(match[0]));
}
