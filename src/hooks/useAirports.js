"use client";

import { useEffect, useState } from "react";
import { getAirports } from "@/api/airports";
import { useI18n } from "@/context/i18n";

// Every departure airport, in the page language. Fetched once per language and shared by every component.
const cache = new Map(); // lang → { status, list }
const pending = new Map(); // lang → Promise

const load = (lang) => {
  if (!pending.has(lang))
    pending.set(
      lang,
      getAirports(lang)
        .then((list) => cache.set(lang, { status: "ok", list }))
        .catch(() => {
          cache.set(lang, { status: "error", list: [] });
          pending.delete(lang); // try again next time
        })
    );
  return pending.get(lang);
};

const LOADING = { status: "loading", list: [] };

// { status: "loading" | "ok" | "error", list }. Read from the cache while rendering: the state only renders again
// once it has loaded.
export const useAirports = (lang) => {
  const [, setLoadedLang] = useState(null);
  useEffect(() => {
    if (cache.has(lang)) return;
    let live = true;
    load(lang).then(() => live && setLoadedLang(lang));
    return () => {
      live = false;
    };
  }, [lang]);
  return cache.get(lang) ?? LOADING;
};

// The airport with that code, if we know it
export const findAirport = (airports, code) => airports.list.find((airport) => airport.code === code);

// "Malta (MLA)", or just the code until the airports load
export const useAirportLabel = (code) => {
  const { lang } = useI18n();
  const city = findAirport(useAirports(lang), code)?.city;
  return city ? `${city} (${code})` : code;
};
