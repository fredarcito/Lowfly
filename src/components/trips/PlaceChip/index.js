"use client";

import { MapPin, XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/context/i18n";
import { flag } from "@/utils/format";

// A town already picked: its flag, name and, below, region and country; a button to pick another one.
// It fades in when picked.
const PlaceChip = ({ place, onChange }) => {
  const { texts } = useI18n();
  return (
    <div className="flex min-h-11 items-center gap-3 rounded-lg border bg-muted/40 py-1.5 pr-1 pl-3 duration-300 animate-in fade-in zoom-in-[0.98] motion-reduce:animate-none">
      <span className="text-xl leading-none">{flag(place.countryCode) || <MapPin className="size-4 text-muted-foreground" />}</span>
      <span className="grid min-w-0 flex-1 leading-tight">
        <span className="truncate font-medium">{place.name}</span>
        <span className="truncate text-sm text-muted-foreground">{[place.region, place.country].filter(Boolean).join(", ")}</span>
      </span>
      <Button type="button" variant="ghost" size="icon" className="size-9 shrink-0" onClick={onChange} aria-label={texts.trips.manual.changeCity}>
        <XIcon />
      </Button>
    </div>
  );
};

export default PlaceChip;
