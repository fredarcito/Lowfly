"use client";

import { ArrowLeftRight, ArrowRight, Luggage } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Toggle } from "@/components/ui/toggle";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useI18n } from "@/context/i18n";
import { WEEKEND_MODES } from "@/constants/weekend";

const MAX_NIGHTS = 30;

// One of the two ends of the stay ("from 2 to 4 nights")
const NightsInput = ({ label, value, onChange }) => (
  <Input
    type="number"
    min="1"
    max={MAX_NIGHTS}
    inputMode="numeric"
    aria-label={label}
    className="h-9 w-14 text-center"
    value={value}
    onChange={(event) => onChange(event.target.value)}
  />
);

// One way or return; for a return trip, how many nights to stay or (anywhere and to a destination) only
// weekends away (constants/weekend)
const TripTypeField = ({ mode, form, onField }) => {
  const { texts } = useI18n();
  const roundTrip = form.trip === "return";
  const weekendOption = roundTrip && WEEKEND_MODES.includes(mode);
  const weekend = weekendOption && form.weekend;

  return (
    <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
      <ToggleGroup
        type="single"
        variant="outline"
        spacing={0}
        value={form.trip}
        onValueChange={(trip) => trip && onField("trip", trip)}
        aria-label={texts.form.tripType}
      >
        <ToggleGroupItem value="oneway" className="h-9 px-3">
          <ArrowRight /> {texts.form.oneway}
        </ToggleGroupItem>
        <ToggleGroupItem value="return" className="h-9 px-3">
          <ArrowLeftRight /> {texts.form.roundTrip}
        </ToggleGroupItem>
      </ToggleGroup>
      {weekendOption && (
        <Toggle variant="outline" size="lg" pressed={form.weekend} onPressedChange={(pressed) => onField("weekend", pressed)} className="h-9 px-3">
          <Luggage /> {texts.form.weekendOnly}
        </Toggle>
      )}
      {weekend && <p className="text-sm text-muted-foreground">{texts.form.weekendHint}</p>}
      {roundTrip && !weekend && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          {texts.form.stayBefore} <NightsInput label={texts.form.minNights} value={form.minN} onChange={(nights) => onField("minN", nights)} />{" "}
          {texts.form.stayBetween} <NightsInput label={texts.form.maxNights} value={form.maxN} onChange={(nights) => onField("maxN", nights)} />{" "}
          {texts.form.stayAfter}
        </div>
      )}
    </div>
  );
};

export default TripTypeField;
