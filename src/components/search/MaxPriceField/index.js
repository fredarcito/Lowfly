import { Input } from "@/components/ui/input";

// The highest price to show, in euros (empty: no limit)
const MaxPriceField = ({ id, value, placeholder, onChange }) => (
  <div className="relative">
    <Input
      id={id}
      type="number"
      min="1"
      inputMode="numeric"
      placeholder={placeholder}
      className="h-11 pr-8"
      value={value}
      onChange={(event) => onChange(event.target.value)}
    />
    <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-sm text-muted-foreground">€</span>
  </div>
);

export default MaxPriceField;
