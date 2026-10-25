"use client";

import { Plus } from "lucide-react";
import { useI18n } from "@/context/i18n";

// The last chip of the places chosen: it opens the search, in its place. Dashed, so it reads as "one more" and not
// as a place already chosen.
const AddPlaceChip = ({ onClick }) => {
  const { texts } = useI18n();
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex h-10 items-center gap-2 rounded-full border border-dashed border-sea/40 px-3.5 text-sm font-medium text-foreground/90 transition-colors outline-none hover:border-sea/70 hover:bg-sea/10 focus-visible:ring-3 focus-visible:ring-ring/50"
    >
      <Plus className="size-4 shrink-0 text-sea" />
      {texts.trips.preferences.mustVisit.add}
    </button>
  );
};

export default AddPlaceChip;
