"use client";

import { useState } from "react";

// How many routes show before "see more" (never every route at once: too many choices confuse)
const FIRST_SHOWN = 5;
const VERSIONS = ["short", "full", "long"];

// The routes shown: by length (`filter`: "all" or a version, only the lengths some route has offered) and the first
// few until "see more" (`showAll`)
export const useRouteFilter = (routes) => {
  const [filter, setFilter] = useState("all");
  const [expanded, setExpanded] = useState(false);
  const versions = VERSIONS.filter((version) => routes.some((route) => route.trips.some((trip) => trip.version === version)));
  const matching = filter === "all" ? routes : routes.filter((route) => route.trips.some((trip) => trip.version === filter));
  const shown = expanded ? matching : matching.slice(0, FIRST_SHOWN);
  const choose = (value) => {
    setFilter(value);
    setExpanded(false);
  };
  return { filter, choose, versions, shown, hidden: matching.length - shown.length, matching, showAll: () => setExpanded(true) };
};
