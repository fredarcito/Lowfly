"use client";

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useI18n } from "@/context/i18n";

const FLEX_DAYS = [1, 2, 3];

// How many days earlier or later the flexible-dates search may move each flight: ±1, ±2 or ±3
const FlexDaysField = ({ id, value, onChange }) => {
  const { texts } = useI18n();
  return (
    <ToggleGroup
      id={id}
      type="single"
      variant="outline"
      spacing={0}
      value={value}
      onValueChange={(days) => days && onChange(days)}
      className="h-11 w-full"
      aria-label={texts.form.flexAria}
    >
      {FLEX_DAYS.map((days) => (
        <ToggleGroupItem key={days} value={String(days)} className="h-11 flex-1" aria-label={texts.form.flexOptionAria(days)}>
          {texts.form.flexShort(days)}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
};

export default FlexDaysField;
