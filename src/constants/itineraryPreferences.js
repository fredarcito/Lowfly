// What the visitor can ask of an AI itinerary. The labels live in i18n (trips.preferences).
export const PACES = ["relaxed", "balanced", "intense"];
export const INTERESTS = ["culture", "food", "nature", "beach", "nightlife", "shopping"];
export const TRANSPORTS = ["walking", "transit", "driving"];
// Accommodation check-in on the first day: every hour from 08:00 to 22:00
export const CHECK_IN_TIMES = Array.from({ length: 15 }, (_, index) => `${String(8 + index).padStart(2, "0")}:00`);

export const DEFAULT_PREFERENCES = { pace: "balanced", interests: ["culture", "food"], transport: "transit", checkIn: "10:00" };
