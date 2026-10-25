"use client";

import { ChevronDown, MapPin } from "lucide-react";
import Collapse from "@/components/shared/Collapse";
import MustVisitField from "@/components/trips/itinerary/MustVisitField";
import { useI18n } from "@/context/i18n";
import { useDisclosure } from "@/hooks/useDisclosure";
import { MUST_VISIT_MAX } from "@/constants/itineraryPreferences";
import { cn } from "@/utils/cn";

// The places the traveller wants for sure in this town (docs/must-visit.md), folded away like the times: a row that
// unfolds them, saying "Optional" or how many there are (never hidden). Without a town there is nowhere to search
// yet, so it waits. `place`: the town picked; `days`: how long the stay is; `cleared`: the town whose places were
// just removed by changing it (a short note says so).
const StopPlaces = ({ id, place, places, days, cleared, onChange }) => {
  const { texts } = useI18n();
  const labels = texts.trips.manual;
  const fold = useDisclosure(places.length > 0);
  const open = fold.open && Boolean(place);
  const badge = !place ? labels.pickTownFirst : places.length ? labels.placesCount(places.length) : labels.optional;

  const add = (added) => {
    const already = places.some((current) => (added.id ? current.id === added.id : current.name === added.name));
    if (!already && places.length < MUST_VISIT_MAX) onChange([...places, added]);
  };

  return (
    <div className="grid gap-2">
      <button
        type="button"
        onClick={fold.toggle}
        disabled={!place}
        aria-expanded={open}
        aria-controls={`${id}-places`}
        className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left ring-1 ring-foreground/10 transition-colors duration-200 outline-none enabled:hover:bg-muted/50 focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <MapPin className="size-5 shrink-0 text-muted-foreground" />
        <span className="min-w-0 flex-1 truncate text-sm font-semibold">
          <span className="sm:hidden">{labels.addPlacesShort}</span>
          <span className="max-sm:hidden">{labels.addPlaces}</span>
        </span>
        <span key={badge} className="shrink-0 rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground duration-300 animate-in fade-in motion-reduce:animate-none">
          {badge}
        </span>
        <ChevronDown className={cn("size-4 shrink-0 text-muted-foreground transition-transform duration-300", open && "rotate-180")} />
      </button>
      {cleared && !places.length && <p className="text-xs text-muted-foreground">{labels.placesCleared(cleared)}</p>}
      <Collapse open={open}>
        <div id={`${id}-places`} className="pt-2 pb-1">
          {place && (
            <MustVisitField
              id={`${id}-must-visit`}
              inline
              places={places}
              onAdd={add}
              onRemove={(index) => onChange(places.filter((current, position) => position !== index))}
              near={{ lat: place.lat, lng: place.lng }}
              town={place.name}
              days={days}
            />
          )}
        </div>
      </Collapse>
    </div>
  );
};

export default StopPlaces;
