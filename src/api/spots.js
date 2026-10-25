// Places the traveller wants in their itinerary (through our API, which asks OpenStreetMap's search)
import { api } from "@/api/client";

// { spots: [{ id, name, street, town, kind, category, lat, lng }], tooFar } for `query` around `near`
// ({ code } of the arrival airport, or { lat, lng }), with the trip's `town`. `areas`: only towns and neighbourhoods.
export const searchSpots = ({ query, near, town, areas = false }, options) =>
  api
    .get("/spots", { params: { q: query, ...near, town, ...(areas ? { areas: 1 } : {}) }, ...options })
    .then((response) => response.data);
