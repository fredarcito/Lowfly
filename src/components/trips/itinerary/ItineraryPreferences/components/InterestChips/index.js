"use client";

import { Check, Landmark, Martini, ShoppingBag, TreePalm, Trees, Utensils } from "lucide-react";
import FormField from "@/components/shared/FormField";
import { cn } from "@/utils/cn";

const ICONS = { culture: Landmark, food: Utensils, nature: Trees, beach: TreePalm, nightlife: Martini, shopping: ShoppingBag };

// The interests as chips in view, like the weekend chips: one tap turns one on or off, and a chosen one shows a
// tick instead of its icon (not only its colour). The last one chosen stays (useItineraryPreferences).
// `options`: [{ id, label }]; `values`: the ids chosen.
const InterestChips = ({ id, label, note, options, values, onToggle, className }) => (
  <FormField id={id} label={label} note={note} className={className}>
    <div id={id} role="group" aria-label={label} className="flex flex-wrap gap-2">
      {options.map((option) => {
        const chosen = values.includes(option.id);
        const Icon = chosen ? Check : (ICONS[option.id] ?? Check);
        return (
          <button
            key={option.id}
            type="button"
            aria-pressed={chosen}
            onClick={() => onToggle(option.id)}
            className={cn(
              "inline-flex h-10 shrink-0 items-center gap-2 rounded-full border px-3.5 text-sm font-medium whitespace-nowrap transition-colors duration-200 outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
              chosen
                ? "border-primary/40 bg-selected text-primary-ink [-webkit-text-stroke:0.4px_currentColor]"
                : "border-input hover:bg-muted dark:bg-input/30 dark:hover:bg-input/50"
            )}
          >
            <Icon
              key={chosen ? "chosen" : "icon"}
              className={cn("size-4 shrink-0 duration-200 animate-in fade-in zoom-in-75 motion-reduce:animate-none", !chosen && "text-muted-foreground")}
            />
            {option.label}
          </button>
        );
      })}
    </div>
  </FormField>
);

export default InterestChips;
