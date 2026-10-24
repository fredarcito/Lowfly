"use client";

import { ChevronDown, Users } from "lucide-react";
import { useI18n } from "@/context/i18n";
import { MAX_PASSENGERS } from "@/constants/searchForm";
import { cn } from "@/utils/cn";

const COUNTS = Array.from({ length: MAX_PASSENGERS }, (_, index) => index + 1);

// How many adults the search is for, 1 to MAX_PASSENGERS: a quiet select (the system's own picker on phones).
// `tall`: the height of the form's fields (in the grid); otherwise the toggles' (in the row of options)
const PassengersField = ({ id, value, onChange, tall = false, className }) => {
  const { texts } = useI18n();

  return (
    <div className={cn("relative", className)}>
      <Users className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
      <select
        id={id}
        aria-label={texts.form.passengersAria}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={cn(
          tall ? "h-11" : "h-9",
          "w-full cursor-pointer appearance-none rounded-lg border bg-background pr-8 pl-9 text-sm font-medium outline-none hover:bg-muted focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30 dark:hover:bg-input/50"
        )}
      >
        {COUNTS.map((count) => (
          <option key={count} value={count}>
            {texts.form.adultsCount(count)}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute top-1/2 right-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
    </div>
  );
};

export default PassengersField;
