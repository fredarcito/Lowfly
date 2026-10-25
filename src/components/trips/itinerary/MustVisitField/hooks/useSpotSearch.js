"use client";

import { useEffect, useState } from "react";
import { isCancelled } from "@/api/client";
import { searchSpots } from "@/api/spots";

// Wait after the last key before searching, and what has to be typed first
const SEARCH_DELAY_MS = 300;
export const MIN_LETTERS = 3;

// Places matching what is typed around the trip's destination (/api/spots), searched a moment after the last key;
// a newer search cancels the previous one. `near`: { code } or { lat, lng }; `areas`: only towns and neighbourhoods.
// { status: "idle" | "loading" | "ok" | "error", list, tooFar }
export const useSpotSearch = (query, { near, town, areas = false }) => {
  const [results, setResults] = useState({ status: "idle", list: [], tooFar: false });
  const nearKey = JSON.stringify(near);

  useEffect(() => {
    const searched = query.trim();
    if (searched.length < MIN_LETTERS) {
      setResults({ status: "idle", list: [], tooFar: false });
      return;
    }
    const request = new AbortController();
    setResults((current) => ({ ...current, status: "loading" }));
    const timer = setTimeout(() => {
      searchSpots({ query: searched, near: JSON.parse(nearKey), town, areas }, { signal: request.signal })
        .then(({ spots, tooFar }) => setResults({ status: "ok", list: spots, tooFar }))
        .catch((error) => !isCancelled(error) && setResults({ status: "error", list: [], tooFar: false }));
    }, SEARCH_DELAY_MS);
    return () => {
      clearTimeout(timer);
      request.abort();
    };
  }, [query, nearKey, town, areas]);

  return results;
};
