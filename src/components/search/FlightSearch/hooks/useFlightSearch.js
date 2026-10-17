"use client";

import { useState } from "react";
import { apiError } from "@/api/client";
import { searchFlights } from "@/api/flights";
import { searchToParams } from "@/utils/share";
import { track } from "@/utils/analytics";
import { WEEKEND_MODES } from "@/constants/weekend";

// No results: the form opens again so the search can be changed
const IS_EMPTY = { everywhere: (data) => !data.results.length, country: (data) => !data.best, trip: (data) => !data.top };

const isAirportCode = (code) => /^[A-Z]{3}$/.test(code);
const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// What to ask the API for a search, or { error } (a key of texts.errors) when the form is not valid
const requestOf = (form, mode) => {
  const { origin, country, city, from, to, ida, vuelta, flex, max, trip, minN, maxN, weekend } = form;
  if (!isAirportCode(origin)) return { error: "badOrigin" };
  if (mode !== "everywhere" && !country) return { error: "missingCountry" };
  const destination = mode === "everywhere" ? {} : { country, ...(city && { city }) };

  if (mode === "trip") {
    if (!ida || !vuelta || vuelta <= ida) return { error: "returnBeforeOut" };
    return { params: { origin, ...destination, ida, vuelta, flex } };
  }

  if (!from || !to || from > to) return { error: "rangeOrder" };
  const params = { origin, from, to, ...(max && { max }), ...destination };
  if (trip !== "return") return { params };
  if (weekend && WEEKEND_MODES.includes(mode)) return { params: { ...params, trip, weekend: 1 } };
  const [fewestNights, mostNights] = [Number(minN), Number(maxN)];
  if (!(fewestNights >= 1 && mostNights >= fewestNights && mostNights <= 30)) return { error: "stayInvalid" };
  return { params: { ...params, trip, minN: fewestNights, maxN: mostNights } };
};

// Running a flight search: its state ({ status: "idle" | "loading" | "error" | "done", mode, data, code, params }),
// the search shown in the one-line summary (`query`) and whether the form is folded into it (`collapsed`).
// A search goes in the URL, so the link can be shared (utils/share).
export const useFlightSearch = (lang) => {
  const [result, setResult] = useState({ status: "idle" });
  const [query, setQuery] = useState(null);
  const [collapsed, setCollapsed] = useState(false);

  // `code` is a key of texts.errors
  const fail = (code, params) => {
    setResult({ status: "error", code, params });
    setCollapsed(false);
  };

  const search = async (form, mode) => {
    const request = requestOf(form, mode);
    if (request.error) return fail(request.error);

    setResult({ status: "loading", mode });
    track("search", { search_term: `${form.origin} → ${form.city || form.country || "anywhere"}`, mode, trip: mode === "trip" ? "return" : form.trip });
    setQuery({ mode, ...form, weekend: form.weekend && form.trip === "return" && WEEKEND_MODES.includes(mode) });
    window.history.replaceState(null, "", `?${searchToParams(form, mode)}`);
    setCollapsed(true);
    window.scrollTo({ top: 0, behavior: reducedMotion() ? "auto" : "smooth" });
    try {
      const data = await searchFlights(mode, { ...request.params, lang });
      setResult({ status: "done", mode, data });
      if (IS_EMPTY[mode](data)) setCollapsed(false);
    } catch (error) {
      const { code, params, retry } = apiError(error);
      fail(code, { ...params, retry });
    }
  };

  // Back to the form (the summary's "Edit"), focused on its first field
  const expand = () => {
    setCollapsed(false);
    requestAnimationFrame(() => document.getElementById("origin")?.focus({ preventScroll: true }));
  };

  const reset = () => setResult({ status: "idle" });

  return { result, query, collapsed, search, expand, reset };
};
