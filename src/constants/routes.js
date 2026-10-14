// App pages (always in English; the language is the first segment)
export const ROUTES = {
  home: (lang) => `/${lang}`,
  trips: (lang) => `/${lang}/trips`,
  trip: (lang, id) => `/${lang}/trips?id=${encodeURIComponent(id)}`,
};
