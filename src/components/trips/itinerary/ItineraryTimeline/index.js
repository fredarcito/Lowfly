import { cn } from "@/utils/cn";

// The dashed timeline through a row, under the markers' column (row padding + half the 2.25rem marker).
// `above`: from the top edge down to the marker; `below`: from the marker to the bottom edge.
// Rows without a marker (the period labels) get the whole height when both are set.
export default function ItineraryTimeline({ above, below }) {
  if (!above && !below) return null;
  return (
    <span
      aria-hidden
      className={cn(
        "absolute left-[calc(0.75rem+1.125rem-1px)] border-l-2 border-dashed border-muted-foreground/30 sm:left-[calc(1rem+1.125rem-1px)]",
        above ? "top-0" : "top-[calc(0.75rem+1.125rem)]",
        below ? "bottom-0" : "h-[calc(0.75rem+1.125rem)]"
      )}
    />
  );
}
