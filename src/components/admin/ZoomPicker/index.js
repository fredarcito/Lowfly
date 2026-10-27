"use client";

import { useAdmin } from "@/components/admin/hooks/useAdmin";
import { cn } from "@/utils/cn";

// A trend chart's zoom (data/zooms), quiet beside its title: `zooms` the ones it offers
const ZoomPicker = ({ zoom, zooms, onChange }) => {
  const { texts } = useAdmin();
  return (
    <div role="group" aria-label={texts.zoom.label} className="flex gap-0.5 rounded-lg bg-muted/60 p-0.5">
      {zooms.map((option) => (
        <button
          key={option}
          type="button"
          aria-pressed={zoom === option}
          onClick={() => onChange(option)}
          className={cn(
            "h-8 rounded-md px-3 text-xs font-medium whitespace-nowrap transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
            zoom === option ? "bg-card text-foreground shadow-sm ring-1 ring-foreground/10" : "text-muted-foreground hover:text-foreground"
          )}
        >
          {texts.zoom.options[option]}
        </button>
      ))}
    </div>
  );
};

export default ZoomPicker;
