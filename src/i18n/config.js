export const APP_NAME = "Lowfly";

// App languages. No dictionaries here, so the server (API routes, proxy) can import it at no cost.
export const LOCALES = ["es", "en"];
export const DEFAULT_LOCALE = "es";

export const hasLocale = (l) => LOCALES.includes(l);

// BCP 47 tag for dates and prices. en-GB: day before month and 24-hour clock, as in Europe.
export const LOCALE_TAGS = { es: "es-ES", en: "en-GB" };

// The first browser language we support, in order of preference (q=)
export function pickLocale(acceptLanguage = "") {
  const prefs = acceptLanguage
    .split(",")
    .map((part) => {
      const [tag, q = "q=1"] = part.trim().split(";");
      return { base: tag.split("-")[0].toLowerCase(), q: Number(q.split("=")[1]) || 0 };
    })
    .sort((a, b) => b.q - a.q);
  return prefs.find((p) => hasLocale(p.base))?.base || DEFAULT_LOCALE;
}
