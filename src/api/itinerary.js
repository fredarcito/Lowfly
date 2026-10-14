// AI itineraries (through our API, which calls Gemini and Wikipedia)
import { api } from "@/api/client";

// The day-by-day plan for a saved trip, in `lang`, following the traveller's preferences.
// It can take a few minutes (the server allows up to 300 s).
// For a trip planned by hand, `stops` (its towns, in order) instead of `trip`.
export const createItinerary = ({ trip, stops, lang, preferences }, options) =>
  api.post("/itinerary", stops ? { stops, lang, preferences } : { trip, lang, preferences }, { timeout: 310_000, ...options }).then((response) => response.data);
