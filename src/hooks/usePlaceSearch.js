"use client";

import { useEffect, useState } from "react";
import { isCancelled } from "@/api/client";
import { searchPlaces } from "@/api/places";

// Wait after the last key before searching, and what has to be typed first
const SEARCH_DELAY_MS = 250;
export const MIN_LETTERS = 2;

// Towns and cities matching what is typed (/api/places), searched a moment after the last key; a newer search
// cancels the previous one. { status: "idle" | "loading" | "ok" | "error", list }
export const usePlaceSearch = (query, lang) => {
  const [results, setResults] = useState({ status: "idle", list: [] });

  useEffect(() => {
    const searched = query.trim();
    if (searched.length < MIN_LETTERS) {
      setResults({ status: "idle", list: [] });
      return;
    }
    const request = new AbortController();
    setResults((current) => ({ ...current, status: "loading" }));
    const timer = setTimeout(() => {
      searchPlaces(searched, lang, { signal: request.signal })
        .then((list) => setResults({ status: "ok", list }))
        .catch((error) => !isCancelled(error) && setResults({ status: "error", list: [] }));
    }, SEARCH_DELAY_MS);
    return () => {
      clearTimeout(timer);
      request.abort();
    };
  }, [query, lang]);

  return results;
};
