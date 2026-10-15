import es from "@/i18n/es";
import en from "@/i18n/en";

export * from "@/i18n/config";

const DICTIONARIES = { es, en };

export const getDictionary = (lang) => DICTIONARIES[lang] || es;

// Translated API error message ({ error: code, params })
export const errorMessage = (texts, code, params = {}) => {
  const msg = texts.errors[code] ?? texts.errors.unknown;
  return typeof msg === "function" ? msg(params) : msg;
};
