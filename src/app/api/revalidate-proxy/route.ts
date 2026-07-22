import { NextResponse } from "next/server";

// Server-side proxy so the shared REVALIDATE_SECRET never reaches the browser.
// Called by lib/api.ts after every successful save/delete to instantly
// refresh the public site's cache instead of waiting on its ISR window.
export async function POST() {
  const url = process.env.PUBLIC_SITE_URL;
  const secret = process.env.REVALIDATE_SECRET;

  if (!url || !secret) return NextResponse.json({ ok: false, skipped: true });

  try {
    await fetch(`${url}/api/revalidate`, {
      method: "POST",
      headers: { "x-revalidate-secret": secret },
    });
  } catch {
    // Best-effort: the public site will still catch up within its normal cache window.
  }

  return NextResponse.json({ ok: true });
}
