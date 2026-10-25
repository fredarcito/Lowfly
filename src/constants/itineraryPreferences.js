// What the visitor can ask of an AI itinerary. The labels live in i18n (trips.preferences).
export const PACES = ["relaxed", "balanced", "intense"];
export const INTERESTS = ["culture", "food", "nature", "beach", "nightlife", "shopping"];
export const TRANSPORTS = ["walking", "transit", "driving"];
// Accommodation check-in on the first day: every hour from 08:00 to 22:00
export const CHECK_IN_TIMES = Array.from({ length: 15 }, (_, index) => `${String(8 + index).padStart(2, "0")}:00`);

export const DEFAULT_PREFERENCES = { pace: "balanced", interests: ["culture", "food"], transport: "transit", checkIn: "10:00", mustVisit: [] };

// Places the traveller wants in the itinerary for sure (docs/must-visit.md): how many, and how far from the
// destination they can be (farther, a day trip does not reach them; server/itinerary keeps nothing farther)
export const MUST_VISIT_MAX = 5;
export const MAX_KM_FROM_DESTINATION = 120;
// What kind of place each one is: found on the map, from its OpenStreetMap tag (server/geocode); not found, the
// traveller says which (all but `town`: a town or a neighbourhood is always found)
export const MUST_VISIT_CATEGORIES = ["food", "sight", "museum", "nature", "shopping", "town", "other"];
export const PICKABLE_CATEGORIES = MUST_VISIT_CATEGORIES.filter((category) => category !== "town");
