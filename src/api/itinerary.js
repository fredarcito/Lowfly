// AI itineraries (through our API, which calls Gemini and Wikipedia)
import { api } from "@/api/client";

// The day-by-day plan for a saved trip, in `lang`, following the traveller's preferences.
// It can take the model up to a couple of minutes.
export const createItinerary = ({ trip, lang, preferences }, options) =>
  api.post("/itinerary", { trip, lang, preferences }, { timeout: 150_000, ...options }).then((response) => response.data);
