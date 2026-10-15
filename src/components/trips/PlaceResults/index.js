"use client";

import { Loader2 } from "lucide-react";
import { useI18n } from "@/context/i18n";
import { flag } from "@/utils/format";
import { cn } from "@/utils/cn";

// The towns found for what was typed, in a list under the box (or that it is searching, found none or failed)
const PlaceResults = ({ listId, results, query, active, onPick, onHover }) => {
  const { texts } = useI18n();
  const labels = texts.trips.manual;
  return (
    <div id={listId} role="listbox" className="absolute inset-x-0 top-full z-30 mt-1 max-h-72 overflow-y-auto rounded-lg bg-popover p-1 shadow-lg ring-1 ring-foreground/10">
      {results.status === "loading" && !results.list.length && (
        <p className="flex items-center gap-2 p-3 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" /> {labels.citySearching}
        </p>
      )}
      {results.status === "error" && <p className="p-3 text-sm text-destructive">{labels.cityError}</p>}
      {results.status === "ok" && !results.list.length && <p className="p-3 text-sm text-muted-foreground">{labels.cityNone(query)}</p>}
      {results.list.map((place, index) => (
        <div
          key={place.id}
          id={`${listId}-${index}`}
          role="option"
          aria-selected={index === active}
          // Keeps the focus in the box, so the click lands before it closes
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => onPick(place)}
          onPointerMove={() => onHover(index)}
          className={cn("flex cursor-pointer items-center gap-3 rounded-md px-2.5 py-2", index === active && "bg-accent")}
        >
          <span className="text-base leading-none">{flag(place.countryCode)}</span>
          <span className="grid min-w-0">
            <span className="truncate font-medium">{place.name}</span>
            <span className="truncate text-xs text-muted-foreground">{[place.region, place.country].filter(Boolean).join(", ")}</span>
          </span>
        </div>
      ))}
    </div>
  );
};

export default PlaceResults;
