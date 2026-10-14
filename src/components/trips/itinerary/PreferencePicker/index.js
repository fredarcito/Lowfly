"use client";

import { ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// A pill showing "Label: value" that opens the options. One choice (`value` + `onChange`)
// or several (`values` + `onToggle`). `options`: [{ id, label }].
export default function PreferencePicker({ icon: Icon, label, options, value, onChange, values, onToggle }) {
  const multiple = Boolean(values);
  const chosen = options.filter((option) => (multiple ? values.includes(option.id) : option.id === value));
  const summary =
    chosen.length > 2 ? `${chosen[0].label}, ${chosen[1].label} +${chosen.length - 2}` : chosen.map((option) => option.label).join(" & ");

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex h-11 items-center gap-2.5 rounded-full border bg-card px-4 text-sm transition-colors hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none data-[state=open]:bg-muted">
        <Icon className="size-4.5 shrink-0 text-muted-foreground" />
        <span className="text-muted-foreground">{label}:</span>
        <span className="font-semibold">{summary}</span>
        <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="center" className="min-w-48">
        {multiple ? (
          options.map((option) => (
            <DropdownMenuCheckboxItem
              key={option.id}
              checked={values.includes(option.id)}
              onCheckedChange={() => onToggle(option.id)}
              // Keep the menu open to pick several
              onSelect={(event) => event.preventDefault()}
            >
              {option.label}
            </DropdownMenuCheckboxItem>
          ))
        ) : (
          <DropdownMenuRadioGroup value={value} onValueChange={onChange}>
            {options.map((option) => (
              <DropdownMenuRadioItem key={option.id} value={option.id}>
                {option.label}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
