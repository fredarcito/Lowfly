// A shared trip's page with ?save=1 keeps it in My trips (SharedTrip)
export const SAVE_SHARED_TRIP = "save";

// App pages (always in English; the language is the first segment)
export const ROUTES = {
  home: (lang) => `/${lang}`,
  trips: (lang) => `/${lang}/trips`,
  trip: (lang, id) => `/${lang}/trips?id=${encodeURIComponent(id)}`,
  newTrip: (lang) => `/${lang}/trips/new`,
  // A trip shared by link (its id is the share's, not the trip's). `saveIt`: keep it in My trips on arrival
  // (back from signing in to save it)
  sharedTrip: (lang, shareId, saveIt = false) => `/${lang}/shared/${shareId}${saveIt ? `?${SAVE_SHARED_TRIP}=1` : ""}`,
  privacy: (lang) => `/${lang}/privacy`,
  terms: (lang) => `/${lang}/terms`,
  // Signing in, then back to `next` (a path of this site)
  login: (lang, next) => `/${lang}/login${next ? `?next=${encodeURIComponent(next)}` : ""}`,
};
