import { NextResponse } from "next/server";
import { defaultOrigin, FALLBACK_ORIGIN } from "@/lib/airports";

// GET /api/origin?tz=Europe/Madrid → { country: "ES", origin: "BCN" }
// Depends on who asks (their IP), so it is never cached.
export async function GET(req) {
  const headers = { "cache-control": "private, no-store" };
  try {
    const country = req.headers.get("x-vercel-ip-country");
    return NextResponse.json(await defaultOrigin(country, req.nextUrl.searchParams.get("tz")), { headers });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ country: null, origin: FALLBACK_ORIGIN }, { headers });
  }
}
