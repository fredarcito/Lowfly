import { handle } from "@/server/handler";
import { AppError, badRequest } from "@/server/errors";
import { getAirports } from "@/server/airports";
import { searchSpots } from "@/server/geocode";
import { allow } from "@/server/rateLimit";

// Searches one visitor can make in a minute: one each time they stop typing, more than enough
const SEARCHES_PER_MINUTE = 60;
const MINUTE = 60_000;

// Where to search around: the trip's arrival airport (?code=MLA) or a town of a trip planned by hand (?lat=&lng=)
const nearOf = async (params) => {
  const code = params.get("code");
  if (code) {
    const { airports } = await getAirports("en");
    const airport = airports.find((candidate) => candidate.code === code.toUpperCase());
    if (airport?.lat != null) return { lat: airport.lat, lng: airport.lon };
  }
  const lat = Number(params.get("lat"));
  const lng = Number(params.get("lng"));
  if (params.get("lat") && params.get("lng") && Math.abs(lat) <= 90 && Math.abs(lng) <= 180) return { lat, lng };
  throw badRequest("aiBadTrip");
};

// GET /api/spots?q=sotto&code=MLA&town=Valletta → { spots: [...], tooFar } (places the traveller wants in the
// itinerary, docs/must-visit.md). &areas=1: only towns and neighbourhoods.
export const GET = handle(async (params, request) => {
  const query = (params.get("q") ?? "").trim().slice(0, 80);
  if (query.length < 3) throw badRequest("placeTooShort");
  const visitor = request.headers.get("x-forwarded-for")?.split(",")[0].trim() || "local";
  if (!allow(`spots:${visitor}`, SEARCHES_PER_MINUTE, MINUTE)) throw new AppError("spotsLimit", {}, 429);
  const town = params.get("town")?.trim().slice(0, 80) || null;
  return searchSpots(query, await nearOf(params), { town, areasOnly: params.get("areas") === "1" });
});
