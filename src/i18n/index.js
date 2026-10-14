import es from "@/i18n/es";
import en from "@/i18n/en";

export * from "@/i18n/config";

const DICTIONARIES = { es, en };

export const getDictionary = (lang) => DICTIONARIES[lang] || es;

// Translated API error message ({ error: code, params })
export const errorMessage = (t, code, params = {}) => {
  const msg = t.errors[code] ?? t.errors.unknown;
  return typeof msg === "function" ? msg(params) : msg;
};
