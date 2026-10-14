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

// { status: "loading" | "ok" | "error", list }
export const useAirports = (lang) => {
  const [airports, setAirports] = useState(() => cache.get(lang) ?? LOADING);
  useEffect(() => {
    let live = true;
    if (cache.has(lang)) setAirports(cache.get(lang));
    else load(lang).then(() => live && setAirports(cache.get(lang) ?? LOADING));
    return () => {
      live = false;
    };
  }, [lang]);
  return airports;
};

// The airport with that code, if we know it
export const findAirport = (airports, code) => airports.list.find((airport) => airport.code === code);

// "Malta (MLA)", or just the code until the airports load
export const useAirportLabel = (code) => {
  const { lang } = useI18n();
  const city = findAirport(useAirports(lang), code)?.city;
  return city ? `${city} (${code})` : code;
};
