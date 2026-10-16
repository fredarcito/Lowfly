import { NextResponse } from "next/server";
import { getPhotos } from "@/server/photos";

// GET /api/photos?codes=CTA,BRI → a photo of the city each airport serves (or null). An airport whose lookup
// failed is missing: then the answer is not cached, so the next visit asks again.
export const GET = async (req) => {
  const codes = [...new Set((req.nextUrl.searchParams.get("codes") || "").toUpperCase().split(","))]
    .filter((code) => /^[A-Z]{3}$/.test(code))
    .slice(0, 12);
  try {
    const photos = await getPhotos(codes);
    const complete = codes.every((code) => code in photos);
    return NextResponse.json(photos, {
      headers: { "cache-control": complete ? "public, s-maxage=604800, stale-while-revalidate=86400" : "no-store" },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({}, { status: 502 });
  }
};
