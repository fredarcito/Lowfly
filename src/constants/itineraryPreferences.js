// What the visitor can ask of an AI itinerary. The labels live in i18n (trips.preferences).
export const PACES = ["relaxed", "balanced", "intense"];
export const INTERESTS = ["culture", "food", "nature", "beach", "nightlife", "shopping"];
export const TRANSPORTS = ["walking", "transit", "driving"];

export const DEFAULT_PREFERENCES = { pace: "balanced", interests: ["culture", "food"], transport: "transit" };
