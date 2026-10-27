// The charts' line colours, each always for the same thing (never by rank). Checked together for colour blindness
// and on both themes' cards (dataviz validator, all pairs): coral and aqua come close for some colour blindness, so
// aqua's line is dashed too.

// Itineraries without an account, beside the total (coral)
export const GUEST = "oklch(0.62 0.13 240)";

// The kinds of search (constants/metrics)
export const SEARCH_MODE_LINES = {
  everywhere: { color: "var(--primary)" },
  country: { color: GUEST },
  trip: { color: "#1baf7a", dash: true },
  multiCity: { color: "#6250d6" },
};

// How a search ended badly: with no results, or with an error
export const OUTCOME_LINES = {
  empty: { color: "var(--primary)" },
  failed: { color: SEARCH_MODE_LINES.multiCity.color },
};
