import { NextRequest, NextResponse } from "next/server";

const API = process.env.NEXT_PUBLIC_API_URL ?? "https://localhost:7287";

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const { pageLabel, pageKey, siteName } = (await req.json()) as {
    pageLabel: string;
    pageKey: string;
    siteName?: string;
  };

  const message = `You are an expert SEO copywriter for a wedding photography studio.

Site: ${siteName || "Wedding Photography Studio"}
Page: ${pageLabel} (key: "${pageKey}")

Write optimised SEO metadata for this page. Return ONLY a valid JSON object with these exact keys and no extra text or markdown:
{
  "metaTitle": "60 characters max, compelling keyword-rich title",
  "metaDescription": "155 characters max, persuasive summary with a CTA",
  "metaKeywords": "8-12 comma-separated keywords relevant to this page"
}`;

  const backendRes = await fetch(`${API}/api/ai/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": authHeader,
    },
    body: JSON.stringify({ message, history: [] }),
  });

  if (!backendRes.ok) {
    const text = await backendRes.text().catch(() => "");
    return NextResponse.json(
      { error: text || `AI service error ${backendRes.status}` },
      { status: backendRes.status },
    );
  }

  const { reply } = (await backendRes.json()) as { reply: string };

  const match = reply.match(/\{[\s\S]*\}/);
  if (!match) {
    return NextResponse.json({ error: "AI returned unexpected format." }, { status: 502 });
  }

  try {
    return NextResponse.json(JSON.parse(match[0]));
  } catch {
    return NextResponse.json({ error: "Could not parse AI response." }, { status: 502 });
  }
}
