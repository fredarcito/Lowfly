import { NextResponse } from "next/server";
import { getPlacePhoto } from "@/server/placePhotos";

// GET /api/photos/place?city=Cúcuta&lat=7.89&lng=-72.51&lang=es → a photo of that town (or null)
export const GET = async (req) => {
  const params = req.nextUrl.searchParams;
  const city = (params.get("city") || "").trim().slice(0, 120);
  const lat = Number(params.get("lat"));
  const lng = Number(params.get("lng"));
  if (!city || !Number.isFinite(lat) || !Number.isFinite(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180) {
    return NextResponse.json({ error: "badRequest" }, { status: 400 });
  }
  try {
    const photo = await getPlacePhoto({ city, lat, lng }, params.get("lang") === "en" ? "en" : "es");
    return NextResponse.json(photo, { headers: { "cache-control": "public, s-maxage=604800, stale-while-revalidate=86400" } });
  } catch (error) {
    console.error(error);
    return NextResponse.json(null, { status: 502 });
  }
};
