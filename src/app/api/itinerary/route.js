import { NextResponse, after } from "next/server";
import { AppError, badRequest } from "@/server/errors";
import { createItinerary, createStopsItinerary } from "@/server/itinerary";
import { saveItineraryUsage } from "@/server/itineraryUsage";
import { allow, release } from "@/server/rateLimit";
import { supabaseServer } from "@/supabase/server";
import { isDay } from "@/utils/dates";
import { hasLocale } from "@/i18n/config";
import { CHECK_IN_TIMES, DEFAULT_PREFERENCES, INTERESTS, PACES, TRANSPORTS } from "@/constants/itineraryPreferences";
import { MAX_STOPS } from "@/constants/manualTrips";
import { ITINERARY_LIMITS } from "@/constants/itineraryLimits";

// A long itinerary can take a few minutes: the model (Claude when Gemini is busy) and checking every place
export const maxDuration = 300;

// A few itineraries a day each (the AI costs money per call; constants/itineraryLimits): per person when signed in
// (counted in Supabase, the same on every server), per IP otherwise (in this server's memory). Not in
// development, where every request comes from the same "local" visitor, unless ITINERARY_LIMITS=on.
const LIMITED = process.env.NODE_ENV === "production" || process.env.ITINERARY_LIMITS === "on";
const DAY = 86_400_000;

// The signed-in person (their id), from the session cookies, or null
const signedInUser = async (supabase) => {
  const { data } = await supabase.auth.getClaims();
  return data?.claims?.sub ?? null;
};

// How many itineraries this person made in the last 24 hours
const itinerariesToday = async (supabase) => {
  const since = new Date(Date.now() - DAY).toISOString();
  const { count, error } = await supabase.from("itinerary_requests").select("id", { count: "exact", head: true }).gte("created_at", since);
  if (error) throw error;
  return count;
};

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

    const supabase = await supabaseServer();
    const userId = await signedInUser(supabase);
    const visitor = request.headers.get("x-forwarded-for")?.split(",")[0].trim() || "local";
    const limitKey = `itinerary:${visitor}`;
    if (LIMITED && userId && (await itinerariesToday(supabase)) >= ITINERARY_LIMITS.userPerDay)
      throw new AppError("aiLimit", { max: ITINERARY_LIMITS.userPerDay }, 429);
    // Without an account: past the guest allowance, signing in gives more (or, with the switch off, the same
    // daily allowance as an account, per IP)
    if (LIMITED && !userId) {
      const { requireAccount, guestPerDay, userPerDay } = ITINERARY_LIMITS;
      if (!allow(limitKey, requireAccount ? guestPerDay : userPerDay, DAY))
        throw requireAccount ? new AppError("aiSignIn", {}, 429) : new AppError("aiLimit", { max: userPerDay }, 429);
    }

    const preferences = readPreferences(body.preferences);
    // What the AI cost, kept once the answer is sent (also when the itinerary failed after the AI answered)
    const aiCalls = [];
    const onAiCall = (call) => aiCalls.push(call);
    after(() =>
      saveItineraryUsage(aiCalls, { userId, kind: stops ? "stops" : "flight", lang, airport: stops ? null : trip.code, preferences })
    );

    let itinerary;
    try {
      itinerary = stops
        ? await createStopsItinerary({ stops, lang, preferences, onAiCall })
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
            onAiCall,
          });
    } catch (error) {
      // A failed attempt does not use up one of the visitor's itineraries
      if (LIMITED && !userId) release(limitKey);
      throw error;
    }
    // Counted once it is made (a failed attempt does not count)
    if (userId) {
      const { error } = await supabase.from("itinerary_requests").insert({ user_id: userId });
      if (error) console.error("Could not count the itinerary", error.message);
    }
    return NextResponse.json(itinerary, { headers: { "cache-control": "no-store" } });
  } catch (error) {
    if (error instanceof AppError) return NextResponse.json({ error: error.code, params: error.params }, { status: error.status });
    console.error(error);
    return NextResponse.json({ error: "aiUnavailable" }, { status: 502 });
  }
};
