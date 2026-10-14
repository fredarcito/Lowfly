import { NextResponse } from "next/server";
import { AppError, badRequest } from "@/server/errors";
import { createItinerary, createStopsItinerary } from "@/server/itinerary";
import { allow, release } from "@/server/rateLimit";
import { isDay } from "@/utils/dates";
import { hasLocale } from "@/i18n/config";
import { CHECK_IN_TIMES, DEFAULT_PREFERENCES, INTERESTS, PACES, TRANSPORTS } from "@/constants/itineraryPreferences";
import { MAX_STOPS } from "@/constants/manualTrips";

// A long itinerary can take a few minutes: the model (Claude when Gemini is busy) and checking every place
export const maxDuration = 300;

// Each visitor may create a few itineraries an hour (the AI costs money per call). Not in development,
// where every request comes from the same "local" visitor.
const PER_HOUR = 5;
const LIMITED = process.env.NODE_ENV === "production";
const HOUR = 3_600_000;

const isTime = (value) => value == null || /^\d{2}:\d{2}$/.test(value);
const isFlight = (flight) => flight && isDay(flight.day) && isTime(flight.time) && isTime(flight.arrive);
const isMoment = (moment) => moment && isDay(moment.day) && isTime(moment.time);
const isCoordinate = (lat, lng) => Number.isFinite(lat) && Number.isFinite(lng) && Math.abs(lat) <= 90 && Math.abs(lng) <= 180;

// A trip planned by hand: 1 to MAX_STOPS towns, each left on or after arriving, and in order
const readStops = (input) => {
  if (!Array.isArray(input) || !input.length || input.length > MAX_STOPS) throw badRequest("aiBadTrip");
  const stops = input.map((stop) => {
    if (!stop?.city || !isCoordinate(stop.lat, stop.lng) || !isMoment(stop.arrive) || !isMoment(stop.leave)) throw badRequest("aiBadTrip");
    if (stop.leave.day < stop.arrive.day) throw badRequest("returnBeforeOut");
    return {
      city: String(stop.city).slice(0, 80),
      country: String(stop.country ?? "").slice(0, 80),
      lat: stop.lat,
      lng: stop.lng,
      arrive: { day: stop.arrive.day, time: stop.arrive.time ?? null },
      leave: { day: stop.leave.day, time: stop.leave.time ?? null },
    };
  });
  if (stops.some((stop, index) => index > 0 && stop.arrive.day < stops[index - 1].leave.day)) throw badRequest("aiBadTrip");
  return stops;
};

const readPreferences = (input = {}) => {
  const interests = Array.isArray(input.interests) ? input.interests.filter((interest) => INTERESTS.includes(interest)) : [];
  return {
    pace: PACES.includes(input.pace) ? input.pace : DEFAULT_PREFERENCES.pace,
    interests: interests.length ? interests : DEFAULT_PREFERENCES.interests,
    transport: TRANSPORTS.includes(input.transport) ? input.transport : DEFAULT_PREFERENCES.transport,
    checkIn: CHECK_IN_TIMES.includes(input.checkIn) ? input.checkIn : DEFAULT_PREFERENCES.checkIn,
  };
};

// POST /api/itinerary → the itinerary, for a saved flight or for a trip planned by hand:
// { trip: { origin, code, city, country, out, ret }, lang, preferences }
// { stops: [{ city, country, lat, lng, arrive: { day, time }, leave: { day, time } }], lang, preferences }
export const POST = async (request) => {
  try {
    const body = await request.json().catch(() => null);
    const trip = body?.trip;
    const stops = body?.stops ? readStops(body.stops) : null;
    if (!stops) {
      if (!trip || !/^[A-Z]{3}$/.test(trip.code ?? "") || !trip.city || !isFlight(trip.out) || (trip.ret && !isFlight(trip.ret)))
        throw badRequest("aiBadTrip");
      if (trip.ret && trip.ret.day < trip.out.day) throw badRequest("returnBeforeOut");
    }
    const lang = hasLocale(body.lang) ? body.lang : "es";

    const visitor = request.headers.get("x-forwarded-for")?.split(",")[0].trim() || "local";
    const limitKey = `itinerary:${visitor}`;
    if (LIMITED && !allow(limitKey, PER_HOUR, HOUR)) throw new AppError("aiLimit", { max: PER_HOUR }, 429);

    let itinerary;
    try {
      const preferences = readPreferences(body.preferences);
      itinerary = stops
        ? await createStopsItinerary({ stops, lang, preferences })
        : await createItinerary({
            trip: {
              code: trip.code,
              city: String(trip.city).slice(0, 80),
              country: String(trip.country ?? "").slice(0, 80),
              out: trip.out,
              ret: trip.ret ?? null,
            },
            lang,
            preferences,
          });
    } catch (error) {
      // A failed attempt does not use up one of the visitor's itineraries
      if (LIMITED) release(limitKey);
      throw error;
    }
    return NextResponse.json(itinerary, { headers: { "cache-control": "no-store" } });
  } catch (error) {
    if (error instanceof AppError) return NextResponse.json({ error: error.code, params: error.params }, { status: error.status });
    console.error(error);
    return NextResponse.json({ error: "aiUnavailable" }, { status: 502 });
  }
};
