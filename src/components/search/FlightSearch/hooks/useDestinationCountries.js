"use client";

import { useEffect, useState } from "react";
import { isCancelled } from "@/api/client";
import { getDestinations } from "@/api/flights";
import { countriesOf } from "@/utils/destinations";

const isAirportCode = (code) => /^[A-Z]{3}$/.test(code);

// Where you can fly from `origin`, grouped by country and city (utils/destinations), refreshed whenever the
// departure airport or the language changes: { status: "loading" | "ok" | "error", list }
export const useDestinationCountries = (origin, lang) => {
  const [countries, setCountries] = useState({ status: "loading", list: [] });

  useEffect(() => {
    if (!isAirportCode(origin)) return;
    const request = new AbortController();
    setCountries({ status: "loading", list: [] });
    getDestinations(origin, lang, { signal: request.signal })
      .then((destinations) => {
        const list = countriesOf(destinations, lang);
        setCountries({ status: list.length ? "ok" : "error", list });
      })
      .catch((error) => !isCancelled(error) && setCountries({ status: "error", list: [] }));
    return () => request.abort();
  }, [origin, lang]);

  return countries;
};
