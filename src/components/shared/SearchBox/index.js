"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

// The search box on top of a picker's list (a combobox): typing filters it, the arrows and Enter move through it
const SearchBox = ({ label, listId, activeId, value, onChange, onKeyDown }) => (
  <div className="relative">
    <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
    <Input
      autoFocus
      type="search"
      role="combobox"
      aria-expanded="true"
      aria-controls={listId}
      aria-activedescendant={activeId}
      aria-label={label}
      placeholder={label}
      autoComplete="off"
      spellCheck={false}
      className="h-11 pl-9 text-base md:text-sm"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      onKeyDown={onKeyDown}
    />
  </div>
);

export default SearchBox;
