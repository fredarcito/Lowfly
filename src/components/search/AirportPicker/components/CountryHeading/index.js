"use client";

import { flag } from "@/utils/format";

// The heading of a country's airports in the full list
const CountryHeading = ({ country, countryCode, count }) => (
  <div aria-hidden="true" className="sticky top-0 z-10 -mx-1.5 mt-1 flex items-center gap-2 border-y border-border bg-muted px-4 py-1.5 first:mt-0">
    <span className="text-base leading-none">{flag(countryCode)}</span>
    <span className="font-heading text-sm font-semibold">{country}</span>
    <span className="ml-auto text-xs text-muted-foreground tabular-nums">{count}</span>
  </div>
);

export default CountryHeading;
