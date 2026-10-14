"use client";

import { ChevronDown } from "lucide-react";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// A labelled field like the search form's, opening the options. It fills its column, so picking
// another option never changes its size. One choice (`value` + `onChange`) or several
// (`values` + `onToggle`). `options`: [{ id, label }].
const PreferencePicker = ({ id, icon: Icon, label, options, value, onChange, values, onToggle }) => {
  const multiple = Boolean(values);
  const chosen = options.filter((option) => (multiple ? values.includes(option.id) : option.id === value));
  const summary = chosen.length > 2 ? `${chosen[0].label}, ${chosen[1].label} +${chosen.length - 2}` : chosen.map((option) => option.label).join(", ");

  return (
    <div className="grid min-w-0 grid-cols-1 content-start gap-1.5">
      <Label htmlFor={id} className="text-muted-foreground">
        {label}
      </Label>
      <DropdownMenu>
        <DropdownMenuTrigger
          id={id}
          className="flex h-11 w-full min-w-0 items-center gap-2 rounded-lg border border-input bg-transparent px-3 text-left text-base transition-colors outline-none hover:bg-muted focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm dark:bg-input/30 dark:hover:bg-input/50"
        >
          <Icon className="size-4 shrink-0 text-muted-foreground" />
          <span className="min-w-0 flex-1 truncate">{summary}</span>
          <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="max-h-72 w-(--radix-dropdown-menu-trigger-width) min-w-44 overflow-y-auto">
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
    </div>
  );
};

export default PreferencePicker;
