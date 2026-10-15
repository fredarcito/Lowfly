"use client";

import { MapPin, XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/context/i18n";
import { flag } from "@/utils/format";

// A town already picked: its flag, name and region, and a button to pick another one
const PlaceChip = ({ place, onChange }) => {
  const { texts } = useI18n();
  return (
    <div className="flex h-11 items-center gap-2 rounded-lg border bg-muted/40 pr-1 pl-3">
      <span className="text-base leading-none">{flag(place.countryCode) || <MapPin className="size-4 text-muted-foreground" />}</span>
      <span className="min-w-0 flex-1 truncate">
        <span className="font-medium">{place.name}</span>
        <span className="text-sm text-muted-foreground"> · {[place.region, place.country].filter(Boolean).join(", ")}</span>
      </span>
      <Button type="button" variant="ghost" size="icon" className="size-9 shrink-0" onClick={onChange} aria-label={texts.trips.manual.changeCity}>
        <XIcon />
      </Button>
    </div>
  );
};

export default PlaceChip;
