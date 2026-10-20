"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { apiError } from "@/api/client";
import { searchFlights, searchStopovers } from "@/api/flights";
import { reportSearch } from "@/api/metrics";
import { searchToParams } from "@/utils/share";
import { track } from "@/utils/analytics";
import { WEEKEND_MODES } from "@/constants/weekend";
import { later, nightsBetween, shift, tomorrow } from "@/utils/dates";
import { MAX_FREE_NIGHTS, MIN_FREE_NIGHTS } from "@/constants/multiCity";
import { DEFAULT_RANGE_DAYS } from "@/constants/searchForm";
import { ROUTES } from "@/constants/routes";

// No results: the form opens again so the search can be changed
const IS_EMPTY = {
  everywhere: (data) => !data.results.length,
  country: (data) => !data.best,
  trip: (data) => !data.top,
  multiCity: (data) => !data.routes.length,
};

// The search found no direct flight there: trips through a hub (server/stopovers) may still go
const NO_DIRECT = ["noRoutes", "noPrices"];

const isAirportCode = (code) => /^[A-Z]{3}$/.test(code);

// What to ask for the trips through a hub (api/flights searchStopovers), or null: a country or city search (not a
// weekend away) as it is; flexible dates as the days they allow, leaving by the latest outbound day and flying home
// from the earliest return day
const stopoverParamsOf = (mode, params) => {
  if (mode === "country") return params.weekend ? null : params;
  if (mode !== "trip") return null;
  const { ida, vuelta, flex, ...place } = params;
  const days = Number(flex);
  const from = later(shift(ida, -days), tomorrow());
  const to = shift(vuelta, days);
  return { ...place, from, to, trip: "return", minN: 1, maxN: Math.min(30, nightsBetween(from, to)), outTo: shift(ida, days), backFrom: shift(vuelta, -days) };
};
// A search over a range of dates whose dates were changed from the form's (from tomorrow, DEFAULT_RANGE_DAYS): for the
// admin's "Uso" page, which tells how many searches share the airlines' answers (the same dates) and how many do not
const changedDates = (form, mode) =>
  ["everywhere", "country"].includes(mode) && (form.from !== tomorrow() || form.to !== shift(tomorrow(), DEFAULT_RANGE_DAYS));

const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// What to ask the API for a search, or { error, params? } (a key of texts.errors and its values) when the form is not
// valid
const requestOf = (form, mode) => {
  const { origin, country, city, from, to, ida, vuelta, flex, max, trip, minN, maxN, weekend, freeFrom, freeTo } = form;
  if (!isAirportCode(origin)) return { error: "badOrigin" };
  if (mode === "multiCity") {
    if (!freeFrom || !freeTo || freeFrom > freeTo) return { error: "rangeOrder" };
    if (nightsBetween(freeFrom, freeTo) < MIN_FREE_NIGHTS) return { error: "multiCityTooShort", params: { min: MIN_FREE_NIGHTS + 1 } };
    if (nightsBetween(freeFrom, freeTo) > MAX_FREE_NIGHTS) return { error: "rangeTooLong", params: { max: MAX_FREE_NIGHTS + 1 } };
    return { params: { origin, from: freeFrom, to: freeTo } };
  }
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

// Running a flight search: its state ({ status: "idle" | "loading" | "error" | "done", mode, searchId, data,
// stopovers, code, params }; `searchId` tells one search's results from the next), the search shown in the one-line summary (`query`) and whether the form is folded into it (`collapsed`).
// A search goes in the URL, so the link can be shared (utils/share): its kind's page with the search as the query
// (from the home, the page it belongs to).
// To a country or city (not a weekend away), and on flexible dates, the trips through a hub are asked at the same
// time, and come after the direct flights: `stopovers` { status: "loading" | "done" | "error", data }. With no direct flight there, `data` is
// null and the search waits for them before telling there is nothing.
export const useFlightSearch = (lang) => {
  const router = useRouter();
  const [result, setResult] = useState({ status: "idle" });
  // The last search started: an older one's answers arriving late are dropped
  const latest = useRef(0);
  const [query, setQuery] = useState(null);
  const [collapsed, setCollapsed] = useState(false);

  // `code` is a key of texts.errors
  const fail = (code, params) => {
    setResult({ status: "error", code, params });
    setCollapsed(false);
  };

  const search = async (form, mode) => {
    const request = requestOf(form, mode);
    // How it ended ("results", "empty" or an error code), for the admin's "Uso" page
    const report = (outcome) => reportSearch({ mode, outcome, customDates: changedDates(form, mode) });
    if (request.error) {
      report(request.error);
      return fail(request.error, request.params);
    }

    setResult({ status: "loading", mode });
    const destination = mode === "multiCity" ? "routes" : form.city || form.country || "anywhere";
    track("search", { search_term: `${form.origin} → ${destination}`, mode, trip: mode === "trip" || mode === "multiCity" ? "return" : form.trip });
    setQuery({ mode, ...form, weekend: form.weekend && form.trip === "return" && WEEKEND_MODES.includes(mode) });
    const page = ROUTES.search(lang, mode);
    const address = `${page}?${searchToParams(form, mode)}`;
    // On its page already: only the query changes; from another (the home), to its page (the search stays, it lives in
    // the layout shared by every search page)
    if (window.location.pathname === page) window.history.replaceState(null, "", address);
    else router.replace(address, { scroll: false });
    setCollapsed(true);
    window.scrollTo({ top: 0, behavior: reducedMotion() ? "auto" : "smooth" });
    const searchId = ++latest.current;
    const isLatest = () => searchId === latest.current;
    const stopoverParams = stopoverParamsOf(mode, request.params);
    const withStopovers = Boolean(stopoverParams);
    const stopoversRequest = withStopovers ? searchStopovers({ ...stopoverParams, lang }).catch(() => null) : null;
    // The trips through a hub, once they arrive: false when a newer search started meanwhile
    const addStopovers = async () => {
      const stopovers = await stopoversRequest;
      if (!isLatest()) return false;
      setResult((current) => ({ ...current, stopovers: stopovers ? { status: "done", data: stopovers } : { status: "error" } }));
      return stopovers;
    };
    try {
      const data = await searchFlights(mode, { ...request.params, lang });
      if (!isLatest()) return;
      setResult({ status: "done", mode, searchId, data, stopovers: withStopovers ? { status: "loading" } : null });
      const stopovers = withStopovers && (await addStopovers());
      const empty = IS_EMPTY[mode](data) && !stopovers?.trips?.length;
      report(empty ? "empty" : "results");
      if (isLatest() && empty) setCollapsed(false);
    } catch (error) {
      if (!isLatest()) return;
      const { code, params, retry } = apiError(error);
      if (withStopovers && NO_DIRECT.includes(code)) {
        const stopovers = await stopoversRequest;
        if (!isLatest()) return;
        if (stopovers?.trips?.length) {
          report("results");
          return setResult({ status: "done", mode, searchId, data: null, stopovers: { status: "done", data: stopovers } });
        }
      }
      report(code);
      fail(code, { ...params, retry });
    }
  };

  // Back to the form (the summary's "Edit"), focused on its first field
  const expand = () => {
    setCollapsed(false);
    requestAnimationFrame(() => document.getElementById("origin")?.focus({ preventScroll: true }));
  };

  const reset = () => {
    latest.current++;
    setResult({ status: "idle" });
  };

  return { result, query, collapsed, search, expand, reset };
};
