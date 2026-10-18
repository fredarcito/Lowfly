import { NextResponse } from "next/server";
import { hasLocale } from "@/i18n/config";
import { createGuideItinerary, writeGuideIntro } from "@/server/itinerary";
import { AppError } from "@/server/errors";

// POST /api/city-guides { city, country, lat, lng, dayCount, lang } → { intro, itinerary }: a city guide's text and
// its itinerary (server/itinerary createGuideItinerary). Only scripts/city-guides.mjs calls it, with CRON_SECRET as a
// bearer token: the guides are made once and kept in src/data/cityGuides.json, never on a visit.
export const maxDuration = 300;

const authorized = (request) => Boolean(process.env.CRON_SECRET) && request.headers.get("authorization") === `Bearer ${process.env.CRON_SECRET}`;

const isCoordinate = (lat, lng) => Number.isFinite(lat) && Number.isFinite(lng) && Math.abs(lat) <= 90 && Math.abs(lng) <= 180;

export const POST = async (request) => {
  if (!authorized(request)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const body = await request.json().catch(() => null);
  const { city, country, lat, lng, dayCount, lang } = body ?? {};
  if (!city || !country || !isCoordinate(lat, lng) || !Number.isInteger(dayCount) || dayCount < 1 || dayCount > 7 || !hasLocale(lang))
    return NextResponse.json({ error: "bad request" }, { status: 400 });
  try {
    const guide = { city: String(city).slice(0, 80), country: String(country).slice(0, 80), dayCount, lang };
    const [intro, itinerary] = await Promise.all([writeGuideIntro(guide), createGuideItinerary({ ...guide, lat, lng })]);
    return NextResponse.json({ intro, itinerary });
  } catch (error) {
    console.error("Could not make the city guide", error);
    const code = error instanceof AppError ? error.code : "aiUnavailable";
    return NextResponse.json({ error: code }, { status: 502 });
  }
};
