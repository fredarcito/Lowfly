"use client";

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useI18n } from "@/context/i18n";
import { cn } from "@/utils/cn";

const FLEX_DAYS = [1, 2, 3];

// How many days earlier or later the flexible-dates search may move each flight: ±1, ±2 or ±3.
// `compact`: the height of the toggles in a row of options, not of the form's fields
const FlexDaysField = ({ id, value, onChange, compact = false }) => {
  const { texts } = useI18n();
  return (
    <ToggleGroup
      id={id}
      type="single"
      variant="outline"
      spacing={0}
      value={value}
      onValueChange={(days) => days && onChange(days)}
      className={compact ? "h-9 w-36" : "h-11 w-full"}
      aria-label={texts.form.flexAria}
    >
      {FLEX_DAYS.map((days) => (
        <ToggleGroupItem key={days} value={String(days)} className={cn("flex-1", compact ? "h-9" : "h-11")} aria-label={texts.form.flexOptionAria(days)}>
          {texts.form.flexShort(days)}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
};

export default FlexDaysField;
