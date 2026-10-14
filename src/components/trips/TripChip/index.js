import { cn } from "@/utils/cn";

// Small rounded label with an icon: "Booked", "In 2 days"…
export default function TripChip({ icon: Icon, className, children }) {
  return (
    <span className={cn("flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 text-xs font-medium", className)}>
      <Icon className="size-3.5" />
      {children}
    </span>
  );
}
