"use client";

import { useState } from "react";
import AddPlaceChip from "@/components/trips/itinerary/MustVisitField/components/AddPlaceChip";
import MustVisitChip from "@/components/trips/itinerary/MustVisitField/components/MustVisitChip";
import NotFoundForm from "@/components/trips/itinerary/MustVisitField/components/NotFoundForm";
import SpotSearch from "@/components/trips/itinerary/MustVisitField/components/SpotSearch";
import MustVisitSection from "@/components/shared/MustVisitSection";
import { useI18n } from "@/context/i18n";
import { MUST_VISIT_MAX } from "@/constants/itineraryPreferences";
import { cn } from "@/utils/cn";

// More places than this for each day (but the last) leaves the plan very tight: a note, not a limit
const PLACES_PER_DAY = 2;

// The places the traveller wants in the itinerary for sure (docs/must-visit.md), in a section of its own (a soft sea
// tint, not coral: that is for the chosen interests and the button). The chosen ones are chips, and the last chip
// adds another: it opens a small search in the same row, whose matches they pick (never the first one for them),
// or "It's not in the list", told with its kind and area. `places`: the trip's preferences.mustVisit; `near`:
// { code } of the arrival airport or { lat, lng } of the town; `town`: its name (the search tries it too);
// `days`: how long the stay is. `inline`: without its section (title and tint), inside a folding row or a section
// that already names it (a trip planned by hand), with its line of help unless `help` is false. `label`: the name
// of its list and its search (one per town, on a trip planned by hand).
const MustVisitField = ({ id, places, onAdd, onRemove, near, town, days, inline = false, help = true, label, className }) => {
  const { texts } = useI18n();
  const labels = texts.trips.preferences.mustVisit;
  const [mode, setMode] = useState("idle");
  const [notFound, setNotFound] = useState(null);
  const full = places.length >= MUST_VISIT_MAX;
  const tight = places.length > PLACES_PER_DAY * Math.max(1, days - 1);
  const name = label ?? labels.label;

  const add = (place) => {
    onAdd(place);
    setNotFound(null);
    setMode("idle");
  };

  const askNotFound = (name) => {
    setNotFound(name);
    setMode("notFound");
  };

  const body = (
    <>
      <ul aria-label={name} className="flex flex-wrap items-start gap-2">
        {places.map((place, index) => (
          <MustVisitChip key={place.id ?? place.name} place={place} onRemove={() => onRemove(index)} />
        ))}
        {!full && mode === "idle" && (
          <li>
            <AddPlaceChip onClick={() => setMode("search")} />
          </li>
        )}
        {!full && mode === "search" && (
          <li className="w-full sm:w-80">
            <SpotSearch
              id={id}
              label={name}
              placeholder={labels.placeholder(town)}
              near={near}
              town={town}
              autoFocus
              compact
              onPick={({ id: spotId, name, category, kind, town: spotTown, lat, lng }) =>
                add({ id: spotId, name, category, kind, town: spotTown, lat, lng, area: null, areaLat: null, areaLng: null })
              }
              onNotInList={askNotFound}
              onDismiss={() => setMode("idle")}
            />
          </li>
        )}
      </ul>

      {!full && mode === "notFound" && <NotFoundForm name={notFound} near={near} town={town} onAdd={add} onCancel={() => setMode("idle")} />}
      {tight && <p className="text-xs text-muted-foreground">{labels.tooMany(days)}</p>}
    </>
  );

  if (inline) {
    return (
      <div className={cn("grid gap-3", className)}>
        {help && <p className="text-xs text-muted-foreground">{labels.help}</p>}
        {body}
      </div>
    );
  }

  return (
    <MustVisitSection id={id} note={labels.note(places.length, MUST_VISIT_MAX)} className={className}>
      {body}
    </MustVisitSection>
  );
};

export default MustVisitField;
