// A shared trip's page with ?save=1 keeps it in My trips (SharedTrip)
export const SAVE_SHARED_TRIP = "save";

// App pages (always in English; the language is the first segment)
export const ROUTES = {
  home: (lang) => `/${lang}`,
  trips: (lang) => `/${lang}/trips`,
  trip: (lang, id) => `/${lang}/trips?id=${encodeURIComponent(id)}`,
  // `to`: an airport code, its town already the first stop (from a route's page)
  newTrip: (lang, to) => `/${lang}/trips/new${to ? `?to=${to}` : ""}`,
  // A trip shared by link (its id is the share's, not the trip's). `saveIt`: keep it in My trips on arrival
  // (back from signing in to save it)
  sharedTrip: (lang, shareId, saveIt = false) => `/${lang}/shared/${shareId}${saveIt ? `?${SAVE_SHARED_TRIP}=1` : ""}`,
  // A route's page, for search engines: /es/flights/malta-barcelona
  flightRoute: (lang, slug) => `/${lang}/flights/${slug}`,
  privacy: (lang) => `/${lang}/privacy`,
  // The team's pages (admins only; anyone else gets "not found"): figures, accounts, settings
  admin: (lang) => `/${lang}/admin`,
  adminUsers: (lang, query) => `/${lang}/admin/users${query ? `?q=${encodeURIComponent(query)}` : ""}`,
  adminUser: (lang, id) => `/${lang}/admin/users/${id}`,
  adminSettings: (lang) => `/${lang}/admin/settings`,
  terms: (lang) => `/${lang}/terms`,
  // Signing in, then back to `next` (a path of this site)
  login: (lang, next) => `/${lang}/login${next ? `?next=${encodeURIComponent(next)}` : ""}`,
};
