"use client";

import { cn } from "@/utils/cn";

// A row of chips to pick one of a few options ({ value, label, price?, hint? }), each with its price when it has
// one: the kinds of trip of a result, or the filter of a list
const KindChips = ({ label, options, value, onChange, className }) => {
  return (
    <div role="radiogroup" aria-label={label} className={cn("flex flex-wrap gap-2", className)}>
      {options.map((option) => {
        const checked = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={checked}
            title={option.hint}
            onClick={() => onChange(option.value)}
            className={cn(
              "flex items-center gap-2 rounded-full px-3.5 py-1.5 text-sm font-medium ring-1 transition-colors focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
              checked ? "bg-primary text-primary-foreground ring-primary" : "bg-card text-foreground ring-foreground/15 hover:bg-muted"
            )}
          >
            {option.label}
            {option.price && <span className={cn("tabular-nums", checked ? "font-bold" : "text-muted-foreground")}>{option.price}</span>}
          </button>
        );
      })}
    </div>
  );
};

export default KindChips;
