// App pages (always in English; the language is the first segment)
export const ROUTES = {
  home: (lang) => `/${lang}`,
  trips: (lang) => `/${lang}/trips`,
  trip: (lang, id) => `/${lang}/trips?id=${encodeURIComponent(id)}`,
  newTrip: (lang) => `/${lang}/trips/new`,
  // A trip shared by link (its id is the share's, not the trip's)
  sharedTrip: (lang, shareId) => `/${lang}/shared/${shareId}`,
  privacy: (lang) => `/${lang}/privacy`,
  terms: (lang) => `/${lang}/terms`,
  // Signing in, then back to `next` (a path of this site)
  login: (lang, next) => `/${lang}/login${next ? `?next=${encodeURIComponent(next)}` : ""}`,
};
