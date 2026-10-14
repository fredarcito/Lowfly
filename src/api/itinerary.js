// AI itineraries (through our API, which calls Gemini and Wikipedia)
import { api } from "@/api/client";

// The day-by-day plan for a saved trip, in `lang`, following the traveller's preferences.
// It can take a few minutes (the server allows up to 300 s).
export const createItinerary = ({ trip, lang, preferences }, options) =>
  api.post("/itinerary", { trip, lang, preferences }, { timeout: 310_000, ...options }).then((response) => response.data);
