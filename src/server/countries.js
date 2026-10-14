// Country name in the requested language from its code, so Ryanair and Wizz match
const names = {};

export const countryName = (code, fallback, lang = "es") => {
  try {
    names[lang] ??= new Intl.DisplayNames([lang], { type: "region" });
    if (code) return names[lang].of(code.toUpperCase());
  } catch {}
  return fallback || code || "—";
};
