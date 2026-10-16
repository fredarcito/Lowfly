import { cn } from "@/utils/cn";

// One headline figure: what it is, the number, an optional line under it and, apart under a divider, an optional
// `footer`. `compact`: smaller, for a page where the figures sit above other things (an account's page).
const StatTile = ({ label, value, hint, footer, compact = false }) => (
  <div className={cn("grid content-start rounded-xl bg-card ring-1 ring-foreground/10", compact ? "gap-0.5 px-4 py-3" : "gap-1 p-5")}>
    <dt className={cn("text-muted-foreground", compact ? "text-xs" : "text-sm")}>{label}</dt>
    <dd className={cn("font-heading font-extrabold tracking-tight tabular-nums", compact ? "text-xl" : "text-3xl")}>{value}</dd>
    {/* Compact on phones: just the figure */}
    {hint && <dd className={cn("text-xs text-muted-foreground", compact && "max-sm:hidden")}>{hint}</dd>}
    {footer && <dd className="mt-2 border-t pt-2.5 text-xs text-muted-foreground">{footer}</dd>}
  </div>
);

export default StatTile;
