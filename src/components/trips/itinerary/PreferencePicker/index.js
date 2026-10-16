"use client";

import { ChevronDown } from "lucide-react";
import FormField from "@/components/shared/FormField";
import { DropdownMenu, DropdownMenuContent, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useDesktop } from "@/hooks/useDesktop";
import { cn } from "@/utils/cn";

const FIELD =
  "flex h-11 w-full min-w-0 items-center gap-2 rounded-lg border border-input bg-transparent px-3 text-left text-base transition-colors md:text-sm dark:bg-input/30";

// A labelled field like the search form's, to pick one option. It fills its column, so picking another option
// never changes its size. On desktop a menu under the field; on phones the system's own picker (the iOS wheel,
// Android's list): an invisible native select over the same field, so it looks the same and never covers the
// form. `options`: [{ id, label }].
const PreferencePicker = ({ id, icon: Icon, label, options, value, onChange }) => {
  const desktop = useDesktop();
  const chosen = options.find((option) => option.id === value);
  const face = (
    <>
      <Icon className="size-4 shrink-0 text-muted-foreground" />
      <span className="min-w-0 flex-1 truncate">{chosen?.label}</span>
      <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
    </>
  );

  if (!desktop) {
    return (
      <FormField id={id} label={label}>
        <div className={cn(FIELD, "relative has-[select:focus-visible]:border-ring has-[select:focus-visible]:ring-3 has-[select:focus-visible]:ring-ring/50")}>
          {face}
          {/* 16px text: iOS zooms into smaller fields */}
          <select
            id={id}
            value={value}
            onChange={(event) => onChange(event.target.value)}
            className="absolute inset-0 size-full cursor-pointer appearance-none text-base opacity-0"
          >
            {options.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </FormField>
    );
  }

  return (
    <FormField id={id} label={label}>
      <DropdownMenu>
        <DropdownMenuTrigger
          id={id}
          className={cn(FIELD, "outline-none hover:bg-muted focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:hover:bg-input/50")}
        >
          {face}
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="max-h-72 w-(--radix-dropdown-menu-trigger-width) min-w-44 overflow-y-auto">
          <DropdownMenuRadioGroup value={value} onValueChange={onChange}>
            {options.map((option) => (
              <DropdownMenuRadioItem key={option.id} value={option.id}>
                {option.label}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </FormField>
  );
};

export default PreferencePicker;
