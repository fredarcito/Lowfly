// Flights: destinations and searches (Ryanair and Wizz Air, through our API)
import { api } from "@/api/client";

const SEARCH_PATHS = { everywhere: "/everywhere", country: "/country", trip: "/flexible" };

// A flight search: mode is everywhere, country or trip (flexible dates)
export const searchFlights = (mode, params, options) =>
  api.get(SEARCH_PATHS[mode], { params, ...options }).then((response) => response.data);

// Where you can fly from `origin`: [{ code, city, country, airlines }]
export const getDestinations = (origin, lang, options) =>
  api.get("/destinations", { params: { origin, lang }, ...options }).then((response) => response.data.destinations);
