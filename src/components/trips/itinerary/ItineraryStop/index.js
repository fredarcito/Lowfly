"use client";

import { Check, ChevronDown, CircleCheck, MapPin, Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";
import Collapse from "@/components/shared/Collapse";
import ItineraryTimeline from "@/components/trips/itinerary/ItineraryTimeline";
import StopDetails from "@/components/trips/itinerary/StopDetails";
import { useI18n } from "@/context/i18n";
import { directionsUrl } from "@/utils/itinerary";
import { cn } from "@/utils/cn";

// The stop's marker: its map number (a tick once visited), a pin for places off the map, a dot otherwise
const StopMarker = ({ stop, open, visited }) => {
  if (stop.place && visited)
    return (
      <span className="grid size-9 place-items-center rounded-full bg-save text-white">
        <Check className="size-4.5" strokeWidth={3} />
      </span>
    );
  if (stop.number)
    return (
      <span
        className={cn(
          "grid size-9 place-items-center rounded-full bg-primary font-heading text-sm font-bold text-primary-foreground shadow-sm transition-shadow",
          open && "ring-4 ring-primary/30"
        )}
      >
        {stop.number}
      </span>
    );
  if (stop.place)
    return (
      <span className="grid size-9 place-items-center rounded-full bg-muted text-muted-foreground">
        <MapPin className="size-4" />
      </span>
    );
  return <span className="size-2.5 rounded-full bg-[color-mix(in_oklab,var(--muted-foreground)_55%,var(--card))] ring-4 ring-card" />;
};

// One stop. Places fold open (one at a time, in step with the map) to show the details,
// "Directions" and "Mark as visited". Other stops (getting around, breakfast…) just show their note.
const ItineraryStop = ({ stop, mode, open, visited, onToggle, onHover, onToggleVisited, lineAbove, lineBelow }) => {
  const { t } = useI18n();
  const foldable = Boolean(stop.place);
  const summary = stop.why ?? stop.note;

  const heading = (
    <>
      {stop.time && <span className="text-xs font-semibold text-muted-foreground tabular-nums">{stop.time}</span>}
      {/* Places lead; steps in between (getting around, breakfast…) are quieter */}
      <span className={cn(foldable ? "font-heading font-semibold" : "text-sm font-medium", visited && "text-muted-foreground")}>{stop.title}</span>
      {foldable && !open && summary && <span className="line-clamp-1 text-sm text-muted-foreground">{summary}</span>}
    </>
  );

  return (
    <li
      id={`stop-${stop.id}`}
      onMouseEnter={stop.number ? () => onHover(stop.number) : undefined}
      onMouseLeave={stop.number ? () => onHover(null) : undefined}
      className={cn("relative grid grid-cols-[2.25rem_minmax(0,1fr)] gap-x-3 px-3 py-3 transition-colors sm:px-4", open && "bg-selected/60")}
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
            <ChevronDown className={cn("mt-5 size-4 text-muted-foreground transition-transform", open && "rotate-180")} />
          </button>
        ) : (
          <div className="grid gap-0.5">
            {heading}
            {stop.note && <p className="text-xs text-muted-foreground sm:text-sm">{stop.note}</p>}
          </div>
        )}

        {foldable && (
          <Collapse open={open}>
            <div className="grid gap-4 pb-1">
              <StopDetails stop={stop} />
              <div className="flex flex-wrap gap-2">
                <Button asChild variant="outline" className="h-10">
                  <a href={directionsUrl(stop.place, mode)} target="_blank" rel="noopener noreferrer">
                    <Navigation /> {t.trips.directions}
                  </a>
                </Button>
                <Button
                  variant={visited ? "secondary" : "ghost"}
                  onClick={onToggleVisited}
                  aria-pressed={visited}
                  className={cn("h-10", visited && "text-save")}
                >
                  <CircleCheck /> {visited ? t.trips.visited : t.trips.markVisited}
                </Button>
              </div>
            </div>
          </Collapse>
        )}
      </div>
    </li>
  );
};

export default ItineraryStop;
