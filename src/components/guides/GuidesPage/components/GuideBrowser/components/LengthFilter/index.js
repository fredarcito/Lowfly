"use client";

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

// The guides' length: a handful of choices, all in sight (any, 1 day, 2 days…), as the flight search's one way or
// return. `dayCounts`: the lengths there are, sorted; `value`: the one picked ("" = any); `texts`: the list's words.
const LengthFilter = ({ dayCounts, value, onChange, texts }) => (
  <ToggleGroup
    type="single"
    variant="outline"
    spacing={0}
    value={value || "any"}
    onValueChange={(picked) => picked && onChange(picked === "any" ? "" : picked)}
    aria-label={texts.length}
    className="h-12 w-full rounded-xl bg-card md:w-auto"
  >
    <ToggleGroupItem value="any" className="h-12 min-w-20 flex-1 justify-center px-4">
      {texts.anyLength}
    </ToggleGroupItem>
    {dayCounts.map((dayCount) => (
      <ToggleGroupItem key={dayCount} value={String(dayCount)} className="h-12 min-w-20 flex-1 justify-center px-4">
        {texts.days(dayCount)}
      </ToggleGroupItem>
    ))}
  </ToggleGroup>
);

export default LengthFilter;
