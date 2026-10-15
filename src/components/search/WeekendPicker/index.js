"use client";

import { useI18n } from "@/context/i18n";
import { cn } from "@/utils/cn";

// The next weekends as chips ("This weekend · 16–19 Oct", then the following ones); a row that scrolls on phones
const WeekendPicker = ({ weekends, picked, onPick }) => {
  const { texts, format } = useI18n();
  return (
    <div role="group" aria-label={texts.deals.weekends} className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 scrollbar-none sm:mx-0 sm:flex-wrap sm:px-0">
      {weekends?.map((weekend, index) => (
        <button
          key={weekend.from}
          type="button"
          aria-pressed={index === picked}
          onClick={() => onPick(index)}
          className={cn(
            "h-9 shrink-0 rounded-full border px-3.5 text-sm font-medium whitespace-nowrap transition-colors focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
            index === picked ? "border-primary/40 bg-selected text-primary-ink [-webkit-text-stroke:0.4px_currentColor]" : "border-input hover:bg-muted"
          )}
        >
          {index === 0 && `${texts.deals.thisWeekend} · `}
          {format.fmtRange(weekend.from, weekend.to)}
        </button>
      ))}
    </div>
  );
};

export default WeekendPicker;
