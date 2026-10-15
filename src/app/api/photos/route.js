import { NextResponse } from "next/server";
import { getPhotos } from "@/server/photos";

// GET /api/photos?codes=CTA,BRI → a photo of the city each airport serves (or null)
export const GET = async (req) => {
  const codes = [...new Set((req.nextUrl.searchParams.get("codes") || "").toUpperCase().split(","))]
    .filter((code) => /^[A-Z]{3}$/.test(code))
    .slice(0, 12);
  try {
    return NextResponse.json(await getPhotos(codes), {
      headers: { "cache-control": "public, s-maxage=604800, stale-while-revalidate=86400" },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({}, { status: 502 });
  }
};
