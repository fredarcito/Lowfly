import { NextResponse } from "next/server";
import { AppError, badRequest } from "@/server/errors";
import { createItinerary } from "@/server/itinerary";
import { allow } from "@/server/rateLimit";
import { isDay } from "@/utils/dates";
import { hasLocale } from "@/i18n/config";
import { CHECK_IN_TIMES, DEFAULT_PREFERENCES, INTERESTS, PACES, TRANSPORTS } from "@/constants/itineraryPreferences";

// A long itinerary can take the model a while
export const maxDuration = 120;

// Each visitor may create a few itineraries an hour (the AI costs money per call)
const PER_HOUR = 5;
const HOUR = 3_600_000;

const isTime = (value) => value == null || /^\d{2}:\d{2}$/.test(value);
const isFlight = (flight) => flight && isDay(flight.day) && isTime(flight.time) && isTime(flight.arrive);

function readPreferences(input = {}) {
  const interests = Array.isArray(input.interests) ? input.interests.filter((interest) => INTERESTS.includes(interest)) : [];
  return {
    pace: PACES.includes(input.pace) ? input.pace : DEFAULT_PREFERENCES.pace,
    interests: interests.length ? interests : DEFAULT_PREFERENCES.interests,
    transport: TRANSPORTS.includes(input.transport) ? input.transport : DEFAULT_PREFERENCES.transport,
    checkIn: CHECK_IN_TIMES.includes(input.checkIn) ? input.checkIn : DEFAULT_PREFERENCES.checkIn,
  };
}

// POST /api/itinerary { trip: { origin, code, city, country, out, ret }, lang, preferences } → the itinerary
export async function POST(request) {
  try {
    const body = await request.json().catch(() => null);
    const trip = body?.trip;
    if (!trip || !/^[A-Z]{3}$/.test(trip.code ?? "") || !trip.city || !isFlight(trip.out) || (trip.ret && !isFlight(trip.ret)))
      throw badRequest("aiBadTrip");
    if (trip.ret && trip.ret.day < trip.out.day) throw badRequest("returnBeforeOut");
    const lang = hasLocale(body.lang) ? body.lang : "es";

    const visitor = request.headers.get("x-forwarded-for")?.split(",")[0].trim() || "local";
    if (!allow(`itinerary:${visitor}`, PER_HOUR, HOUR)) throw new AppError("aiLimit", { max: PER_HOUR }, 429);

    const itinerary = await createItinerary({
      trip: {
        code: trip.code,
        city: String(trip.city).slice(0, 80),
        country: String(trip.country ?? "").slice(0, 80),
        out: trip.out,
        ret: trip.ret ?? null,
      },
      lang,
      preferences: readPreferences(body.preferences),
    });
    return NextResponse.json(itinerary, { headers: { "cache-control": "no-store" } });
  } catch (error) {
    if (error instanceof AppError) return NextResponse.json({ error: error.code, params: error.params }, { status: error.status });
    console.error(error);
    return NextResponse.json({ error: "aiUnavailable" }, { status: 502 });
  }
}
