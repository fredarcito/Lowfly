import { ChevronDown } from "lucide-react";

// A native select with the search field's look: same height and border, and its own arrow with room to breathe
// (the browser's sits against the edge). `options`: [{ value, label }].
const SelectField = ({ label, value, onChange, options }) => (
  <span className="relative inline-flex">
    <select
      aria-label={label}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="h-11 w-full min-w-0 appearance-none rounded-lg border border-input bg-transparent pr-10 pl-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
    <ChevronDown aria-hidden className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted-foreground" />
  </span>
);

export default SelectField;
