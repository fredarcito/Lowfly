"use client";

import { useEffect, useState } from "react";
import { searchFlights } from "@/api/flights";
import { nextWeekends } from "@/utils/weekend";

const isAirportCode = (code) => /^[A-Z]{3}$/.test(code);

// The cheapest weekend trips from `origin`, for each of the next `count` weekends. Each weekend loads when
// picked and is kept, so going back to one is instant. Dates on the client only: "today" and its time zone are
// the visitor's. Returns the weekends, the picked one and its trips ({ status: loading | ok | error, results }).
export const useWeekendDeals = (origin, lang, count) => {
  const [weekends, setWeekends] = useState(null);
  const [picked, setPicked] = useState(0);
  const [loaded, setLoaded] = useState({}); // "MLA es 2026-10-16" → { status, data }

  useEffect(() => setWeekends(nextWeekends(count)), [count]);

  const weekend = weekends?.[picked];
  const key = weekend && `${origin} ${lang} ${weekend.from}`;
  const state = (key && loaded[key]) ?? { status: "loading" };

  useEffect(() => {
    if (!weekend || !isAirportCode(origin) || loaded[key]) return;
    searchFlights("everywhere", { origin, ...weekend, trip: "return", weekend: "1", lang })
      .then((data) => ({ status: "ok", data }))
      .catch(() => ({ status: "error" }))
      .then((result) => setLoaded((current) => ({ ...current, [key]: result })));
  }, [origin, lang, weekend, key, loaded]);

  return { weekends, picked, setPicked, weekend, status: state.status, results: state.data?.results ?? [] };
};
