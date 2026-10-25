"use client";

import { Loader2, Plus } from "lucide-react";
import { useI18n } from "@/context/i18n";
import { iconOf } from "@/components/trips/itinerary/MustVisitField/data/categoryIcons";
import { cn } from "@/utils/cn";

// The places found for what was typed, in a list under the box: each with its icon, name, street and town, so two
// branches of a chain can be told apart. Then, with `onNotInList`, a last option to add one we did not find.
const SpotResults = ({ listId, results, query, active, onPick, onNotInList, onHover }) => {
  const { texts } = useI18n();
  const labels = texts.trips.preferences.mustVisit;
  const { status, list, tooFar } = results;
  const option = (index) => ({
    id: `${listId}-${index}`,
    role: "option",
    "aria-selected": index === active,
    // Keeps the focus in the box, so the click lands before it closes
    onMouseDown: (event) => event.preventDefault(),
    onPointerMove: () => onHover(index),
  });

  return (
    <div id={listId} role="listbox" className="absolute inset-x-0 top-full z-30 mt-1 max-h-80 overflow-y-auto rounded-lg bg-popover p-1 shadow-lg ring-1 ring-foreground/10">
      {status === "loading" && !list.length && (
        <p className="flex items-center gap-2 p-3 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" /> {labels.searching}
        </p>
      )}
      {status === "error" && <p className="p-3 text-sm text-destructive">{labels.error}</p>}
      {status === "ok" && !list.length && <p className="p-3 text-sm text-muted-foreground">{tooFar ? labels.tooFar(query) : labels.none(query)}</p>}
      {list.map((spot, index) => {
        const Icon = iconOf(spot.category);
        return (
          <div
            key={spot.id}
            {...option(index)}
            onClick={() => onPick(spot)}
            className={cn("flex cursor-pointer items-center gap-3 rounded-md px-2.5 py-2", index === active && "bg-accent")}
          >
            <Icon className="size-4 shrink-0 text-muted-foreground" />
            <span className="grid min-w-0">
              <span className="truncate font-medium">{spot.name}</span>
              <span className="truncate text-xs text-muted-foreground">{[spot.street, spot.town].filter(Boolean).join(" · ")}</span>
            </span>
          </div>
        );
      })}
      {onNotInList && status !== "loading" && (
        <div
          {...option(list.length)}
          onClick={onNotInList}
          className={cn(
            "flex cursor-pointer items-center gap-3 rounded-md px-2.5 py-2.5 text-sm font-medium",
            list.length > 0 && "mt-1 border-t",
            list.length === active && "bg-accent"
          )}
        >
          <Plus className="size-4 shrink-0 text-muted-foreground" />
          {labels.notInList}
        </div>
      )}
    </div>
  );
};

export default SpotResults;
