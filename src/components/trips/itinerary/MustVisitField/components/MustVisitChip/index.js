"use client";

import { XIcon } from "lucide-react";
import { useI18n } from "@/context/i18n";
import { CATEGORY_ICONS } from "@/components/trips/itinerary/MustVisitField/data/categoryIcons";

// A place chosen: its kind's icon, its name and a button to remove it. Neutral, not coral: the chosen interests
// and the "Create" button already use it.
const MustVisitChip = ({ place, onRemove }) => {
  const { texts } = useI18n();
  const Icon = CATEGORY_ICONS[place.category] ?? CATEGORY_ICONS.other;
  return (
    <li className="inline-flex h-10 max-w-full items-center gap-2 rounded-full border border-input bg-card pr-1 pl-3.5 text-sm font-medium duration-200 animate-in fade-in zoom-in-95 motion-reduce:animate-none">
      <Icon className="size-4 shrink-0 text-muted-foreground" />
      <span className="truncate">{place.name}</span>
      <button
        type="button"
        onClick={onRemove}
        aria-label={texts.trips.preferences.mustVisit.remove(place.name)}
        className="grid size-8 shrink-0 place-items-center rounded-full text-muted-foreground transition-colors outline-none hover:bg-muted hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        <XIcon className="size-4" />
      </button>
    </li>
  );
};

export default MustVisitChip;
