"use client";

import { useId, useState } from "react";
import { Check, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import MustVisitChip from "@/components/trips/itinerary/MustVisitField/components/MustVisitChip";
import SpotSearch from "@/components/trips/itinerary/MustVisitField/components/SpotSearch";
import { iconOf } from "@/components/trips/itinerary/MustVisitField/data/categoryIcons";
import { useI18n } from "@/context/i18n";
import { PICKABLE_CATEGORIES } from "@/constants/itineraryPreferences";
import { cn } from "@/utils/cn";

// A place we did not find on the map ("It's not in the list"), in place of the search box: what kind of place it
// is (required: a meal is planned as lunch or dinner, a museum for the hottest hours…) and, if they know, the area
// it is in (a neighbourhood or a town, which we do find: enough to put it on the right day). It goes in the plan
// without a pin. `onAdd(place)` with the same shape as a place found, without its own position.
const NotFoundForm = ({ name, near, town, onAdd, onCancel }) => {
  const { texts } = useI18n();
  const labels = texts.trips.preferences.mustVisit;
  const areaId = useId();
  const hintId = useId();
  const [category, setCategory] = useState(null);
  const [area, setArea] = useState(null);
  const [areaText, setAreaText] = useState("");

  const add = () =>
    onAdd({
      id: null,
      name,
      category,
      kind: null,
      town: null,
      lat: null,
      lng: null,
      area: area?.name ?? (areaText.trim() || null),
      areaLat: area?.lat ?? null,
      areaLng: area?.lng ?? null,
    });

  return (
    <div className="grid gap-3 rounded-lg border border-input bg-card p-3 duration-200 animate-in fade-in motion-reduce:animate-none sm:p-3.5">
      <p className="text-sm">{labels.notFound(name)}</p>

      <div role="radiogroup" aria-label={labels.whatIsIt} className="flex flex-wrap gap-1.5">
        {PICKABLE_CATEGORIES.map((option) => {
          const chosen = option === category;
          const Icon = chosen ? Check : iconOf(option);
          return (
            <button
              key={option}
              type="button"
              role="radio"
              aria-checked={chosen}
              onClick={() => setCategory(option)}
              className={cn(
                "inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full border px-3 text-sm font-medium whitespace-nowrap transition-colors duration-200 outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                chosen
                  ? "border-primary/40 bg-selected text-primary-ink [-webkit-text-stroke:0.4px_currentColor]"
                  : "border-input hover:bg-muted dark:bg-input/30 dark:hover:bg-input/50"
              )}
            >
              <Icon className={cn("size-4 shrink-0", !chosen && "text-muted-foreground")} />
              {labels.categories[option]}
            </button>
          );
        })}
      </div>

      <div className="grid gap-1">
        <label htmlFor={areaId} className="flex items-baseline gap-2 text-sm text-muted-foreground">
          {labels.whereIsIt} <span className="text-xs text-muted-foreground/70">{labels.optional}</span>
        </label>
        {area ? (
          <ul className="flex">
            <MustVisitChip place={{ ...area, category: "town" }} onRemove={() => setArea(null)} />
          </ul>
        ) : (
          <SpotSearch id={areaId} placeholder={labels.areaPlaceholder} near={near} town={town} areas compact onPick={setArea} onType={setAreaText} />
        )}
      </div>

      {/* Without a kind there is nothing to add: a quiet hint says why, beside the buttons */}
      <div className="flex flex-wrap items-center justify-end gap-x-3 gap-y-2 border-t pt-3">
        {!category && (
          <p id={hintId} aria-live="polite" className="mr-auto text-xs text-muted-foreground">
            {labels.pickCategory}
          </p>
        )}
        <div className="ml-auto flex gap-2">
          <Button type="button" variant="ghost" className="h-10 px-4" onClick={onCancel}>
            {labels.cancel}
          </Button>
          {/* The app's secondary button (as in ConfirmDialog and ShareLinkBox): coral is only for "Create itinerary" */}
          <Button
            type="button"
            variant="outline"
            disabled={!category}
            aria-describedby={category ? undefined : hintId}
            className="h-10 px-4 font-semibold"
            onClick={add}
          >
            <Plus />
            {labels.confirm}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFoundForm;
