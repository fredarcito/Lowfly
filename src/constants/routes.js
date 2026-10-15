// App pages (always in English; the language is the first segment)
export const ROUTES = {
  home: (lang) => `/${lang}`,
  trips: (lang) => `/${lang}/trips`,
  trip: (lang, id) => `/${lang}/trips?id=${encodeURIComponent(id)}`,
  newTrip: (lang) => `/${lang}/trips/new`,
  privacy: (lang) => `/${lang}/privacy`,
  // Signing in, then back to `next` (a path of this site)
  login: (lang, next) => `/${lang}/login${next ? `?next=${encodeURIComponent(next)}` : ""}`,
};
