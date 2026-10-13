import { NextResponse } from "next/server";
import { getPhotos } from "@/lib/photos";

// GET /api/photos?codes=CTA,BRI → a photo of the city each airport serves (or null)
export async function GET(req) {
  const codes = [...new Set((req.nextUrl.searchParams.get("codes") || "").toUpperCase().split(","))]
    .filter((c) => /^[A-Z]{3}$/.test(c))
    .slice(0, 12);
  try {
    return NextResponse.json(await getPhotos(codes), {
      headers: { "cache-control": "public, s-maxage=604800, stale-while-revalidate=86400" },
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({}, { status: 502 });
  }
}
