"use client";

import { useState } from "react";
import { defaultTripOf } from "@/utils/multiCity";

// How many routes show before "see more" (never every route at once: too many choices confuse)
const FIRST_SHOWN = 5;
const VERSIONS = ["short", "full", "long"];

// The routes shown: by length (`filter`: "all" or a version, only the lengths some route has offered), in the order
// picked (`sort`: "recommended", the server's, or "price", the price each card shows first, cheapest first) and the
// first few until "see more" (`showAll`)
export const useRouteFilter = (routes) => {
  const [filter, setFilter] = useState("all");
  const [sort, setSort] = useState("recommended");
  const [expanded, setExpanded] = useState(false);
  const versions = VERSIONS.filter((version) => routes.some((route) => route.trips.some((trip) => trip.version === version)));
  const preferred = filter === "all" ? null : filter;
  const filtered = preferred ? routes.filter((route) => route.trips.some((trip) => trip.version === preferred)) : routes;
  const priceOf = (route) => defaultTripOf(route, preferred).price;
  const matching = sort === "price" ? [...filtered].sort((first, second) => priceOf(first) - priceOf(second)) : filtered;
  const shown = expanded ? matching : matching.slice(0, FIRST_SHOWN);
  const choose = (value) => {
    setFilter(value);
    setExpanded(false);
  };
  const order = (value) => {
    setSort(value);
    setExpanded(false);
  };
  return { filter, choose, sort, order, versions, shown, hidden: matching.length - shown.length, matching, showAll: () => setExpanded(true) };
};
