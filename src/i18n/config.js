export const APP_NAME = "Lowfly";

// App languages. No dictionaries here, so the server (API routes, proxy) can import it at no cost.
export const LOCALES = ["es", "en"];
export const DEFAULT_LOCALE = "es";

export const hasLocale = (locale) => LOCALES.includes(locale);

// BCP 47 tag for dates and prices. en-GB: day before month and 24-hour clock, as in Europe.
export const LOCALE_TAGS = { es: "es-ES", en: "en-GB" };

// The first browser language we support, in order of preference (q=)
export const pickLocale = (acceptLanguage = "") => {
  const prefs = acceptLanguage
    .split(",")
    .map((part) => {
      const [tag, quality = "q=1"] = part.trim().split(";");
      return { base: tag.split("-")[0].toLowerCase(), q: Number(quality.split("=")[1]) || 0 };
    })
    .sort((first, second) => second.q - first.q);
  return prefs.find((preference) => hasLocale(preference.base))?.base || DEFAULT_LOCALE;
};
