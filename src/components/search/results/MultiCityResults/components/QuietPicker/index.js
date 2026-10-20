"use client";

import { ChevronDown } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { cn } from "@/utils/cn";

// A quiet picker for the results' order and length filter, with an icon telling the two apart, the options plain
// with a thin border. The option picked stands out: in the soft coral of the search's own tabs with `accent` (the
// order, the one to notice; never the filled coral of a main action), otherwise in a neutral tint. Wider screens:
// every option in sight. Phones: a compact menu showing the option picked, so both fit in one line above the
// results. `options`: [{ value, label }].
const QuietPicker = ({ label, icon: Icon, options, value, onChange, accent = false }) => {
  const picked = options.find((option) => option.value === value) ?? options[0];
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          aria-label={label}
          className="flex h-9 items-center gap-1.5 rounded-full px-3.5 text-sm font-medium ring-1 ring-foreground/15 outline-none focus-visible:ring-3 focus-visible:ring-ring/50 sm:hidden"
        >
          <Icon aria-hidden="true" className="size-4 text-muted-foreground" />
          <span className={accent ? "text-primary-ink" : undefined}>{picked.label}</span>
          <ChevronDown aria-hidden="true" className="size-4 text-muted-foreground" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="min-w-44">
          <DropdownMenuRadioGroup value={value} onValueChange={onChange}>
            {options.map((option) => (
              <DropdownMenuRadioItem key={option.value} value={option.value}>
                {option.label}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      <div className="flex items-center gap-2 max-sm:hidden">
        <Icon aria-hidden="true" className="size-4 shrink-0 text-muted-foreground" />
        <div role="radiogroup" aria-label={label} className="flex flex-wrap gap-1.5">
          {options.map((option) => {
            const checked = option.value === value;
            return (
              <button
                key={option.value}
                type="button"
                role="radio"
                aria-checked={checked}
                onClick={() => onChange(option.value)}
                className={cn(
                  "rounded-full px-3.5 py-1.5 text-sm font-medium ring-1 transition-colors focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
                  !checked && "text-foreground ring-foreground/15 hover:bg-muted",
                  checked && (accent ? "bg-selected text-primary-ink ring-primary/40" : "bg-foreground/10 text-foreground ring-foreground/30")
                )}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default QuietPicker;
