import es from "@/lib/i18n/es";
import en from "@/lib/i18n/en";

export * from "@/lib/i18n/config";

const DICTIONARIES = { es, en };

export const getDictionary = (lang) => DICTIONARIES[lang] || es;

// Translated API error message ({ error: code, params })
export function errorMessage(t, code, params = {}) {
  const msg = t.errors[code] ?? t.errors.unknown;
  return typeof msg === "function" ? msg(params) : msg;
}
