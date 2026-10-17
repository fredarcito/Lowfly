"use client";

import { ChevronDown, CircleCheck, Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";
import Collapse from "@/components/shared/Collapse";
import ItineraryTimeline from "@/components/trips/itinerary/ItineraryTimeline";
import StopDetails from "@/components/trips/itinerary/StopDetails";
import { useI18n } from "@/context/i18n";
import { directionsUrl } from "@/utils/itinerary";
import { cn } from "@/utils/cn";
import ExcursionMark from "@/components/trips/itinerary/ItineraryStop/components/ExcursionMark";
import StopMarker from "@/components/trips/itinerary/ItineraryStop/components/StopMarker";
import MealChip from "@/components/trips/itinerary/ItineraryStop/components/MealChip";

// One stop. Places fold open (one at a time, in step with the map) to show the details,
// "Directions" and "Mark as visited" (with `onToggleVisited`). A meal without a set place (breakfast "around the
// Plaza Mayor") folds open too, for its dishes, with nowhere to go or tick. Other stops (getting around…) just show
// their note. A meal that folds keeps its note under its title, open or closed (it does not jump into the details), and
// "What to try and where" under it opens and closes it, instead of the arrow (its title still does too).
// `excursionTown`: the stop is in the town of the day's trip, tagged "Day trip" beside its name. `town`: where the
// stop is, for a meal's map search.
const ItineraryStop = ({ stop, mode, excursionTown, town, open, visited, onToggle, onHover, onToggleVisited, lineAbove, lineBelow }) => {
  const { texts } = useI18n();
  const placed = Boolean(stop.place);
  const foldable = placed || stop.dishes?.length > 0 || Boolean(stop.food);
  const meal = foldable && stop.type === "comida";
  const summary = meal ? null : (stop.why ?? stop.note);

  const heading = (
    <>
      {stop.time && <span className="text-xs font-semibold text-muted-foreground tabular-nums">{stop.time}</span>}
      {/* Places lead; steps in between (getting around, breakfast…) are quieter */}
      <span className={cn("flex flex-wrap items-center gap-x-2 gap-y-1", placed ? "font-heading font-semibold" : "text-sm font-medium", visited && "text-muted-foreground")}>
        <span className="min-w-0">{stop.title}</span>
        {excursionTown && <ExcursionMark town={excursionTown} />}
      </span>
      {foldable && !open && summary && <span className="line-clamp-1 text-sm text-muted-foreground">{summary}</span>}
      {meal && stop.note && <span className="text-sm text-muted-foreground">{stop.note}</span>}
    </>
  );

  return (
    <li
      id={`stop-${stop.id}`}
      onMouseEnter={stop.number ? () => onHover(stop.number) : undefined}
      onMouseLeave={stop.number ? () => onHover(null) : undefined}
      // Open: a slightly lighter, neutral surface, so the text stays as readable as closed
      className={cn("relative grid grid-cols-[2.25rem_minmax(0,1fr)] gap-x-3 px-3 py-3 transition-colors sm:px-4", open && "bg-foreground/[0.04] ring-1 ring-foreground/10 ring-inset")}
    >
      <ItineraryTimeline above={lineAbove} below={lineBelow} />
      <span className="relative z-10 grid size-9 place-items-center">
        <StopMarker stop={stop} open={open} visited={visited} />
      </span>

      <div className="grid min-w-0 gap-3">
        {foldable ? (
          <button
            type="button"
            onClick={onToggle}
            aria-expanded={open}
            className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-x-3 rounded-md text-left outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <span className="grid min-w-0 gap-0.5">{heading}</span>
            {!meal && <ChevronDown className={cn("mt-5 size-4 text-muted-foreground transition-transform", open && "rotate-180")} />}
          </button>
        ) : (
          <div className="grid gap-0.5">
            {heading}
            {stop.note && <p className="text-xs text-muted-foreground sm:text-sm">{stop.note}</p>}
          </div>
        )}

        {meal && <MealChip open={open} onClick={onToggle} />}

        {foldable && (
          <Collapse open={open}>
            <div className="grid gap-4 pb-1">
              <StopDetails stop={stop} town={town} />
              {placed && (
                <div className="flex flex-wrap gap-2">
                  <Button asChild variant="outline" className="h-10">
                    <a href={directionsUrl(stop.place, mode)} target="_blank" rel="noopener noreferrer">
                      <Navigation /> {texts.trips.directions}
                    </a>
                  </Button>
                  {onToggleVisited && (
                    <Button
                      variant={visited ? "secondary" : "outline"}
                      onClick={onToggleVisited}
                      aria-pressed={visited}
                      className={cn("h-10", visited && "text-save")}
                    >
                      <CircleCheck /> {visited ? texts.trips.visited : texts.trips.markVisited}
                    </Button>
                  )}
                </div>
              )}
            </div>
          </Collapse>
        )}
      </div>
    </li>
  );
};

export default ItineraryStop;
