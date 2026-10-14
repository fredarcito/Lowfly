import { NextResponse } from "next/server";
import { DEFAULT_ORIGIN } from "@/constants/airports";
import { defaultOrigin } from "@/server/airports";

// GET /api/origin?tz=Europe/Madrid → { country: "ES", origin: "BCN" }
// Depends on who asks (their IP), so it is never cached.
export const GET = async (req) => {
  const headers = { "cache-control": "private, no-store" };
  try {
    const country = req.headers.get("x-vercel-ip-country");
    return NextResponse.json(await defaultOrigin(country, req.nextUrl.searchParams.get("tz")), { headers });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ country: null, origin: DEFAULT_ORIGIN }, { headers });
  }
};
