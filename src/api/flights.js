// Flights: destinations and searches (Ryanair and Wizz Air, through our API)
import { api } from "@/api/client";

const SEARCH_PATHS = { everywhere: "/everywhere", country: "/country", trip: "/flexible" };

// A flight search: mode is everywhere, country or trip (flexible dates)
export const searchFlights = (mode, params, options) =>
  api.get(SEARCH_PATHS[mode], { params, ...options }).then((response) => response.data);

// Where you can fly from `origin`: [{ code, city, country, airlines, stopover? }], with the airports reached with
// one stop only (`stopover: true`)
export const getDestinations = (origin, lang, options) =>
  api.get("/destinations", { params: { origin, lang, stopovers: 1 }, ...options }).then((response) => response.data.destinations);

// Trips through a hub to a country or city (server/stopovers), with the country search's parameters
export const searchStopovers = (params, options) => api.get("/stopovers", { params, ...options }).then((response) => response.data);
