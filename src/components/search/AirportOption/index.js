"use client";

import { flag } from "@/utils/format";
import { cn } from "@/utils/cn";

// One airport in the picker: its name (and, in search results, its country) and its code
const AirportOption = ({ id, airport, index, active, selected, withCountry, onPick, onHover }) => (
  <div
    id={id}
    role="option"
    aria-selected={selected}
    data-index={index}
    onClick={onPick}
    onPointerMove={onHover}
    className={cn("my-0.5 flex cursor-pointer items-center gap-3 rounded-md px-2.5 py-2", active && "bg-accent", selected && "text-primary-ink")}
  >
    <span className="grid min-w-0 flex-1">
      <span className="truncate">{airport.name}</span>
      {withCountry && (
        <span className="truncate text-xs text-muted-foreground">
          {flag(airport.countryCode)} {airport.country}
        </span>
      )}
    </span>
    <span className="shrink-0 text-xs font-semibold tracking-widest text-muted-foreground">{airport.code}</span>
  </div>
);

export default AirportOption;
