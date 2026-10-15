"use client";

import { Fragment } from "react";
import { Check } from "lucide-react";
import { useI18n } from "@/context/i18n";
import { cn } from "@/utils/cn";

// Where the visitor is in planning the trip: "● Route ──── ○ Your style", the line filling as they go on
const TripSteps = ({ steps, current }) => {
  const { texts } = useI18n();
  const labels = texts.trips.manual;
  return (
    <ol aria-label={labels.step(current + 1, steps.length)} className="flex max-w-md items-center gap-3">
      {steps.map((step, index) => {
        const done = index < current;
        const active = index === current;
        return (
          <Fragment key={step}>
            {index > 0 && (
              <li aria-hidden className="h-0.5 flex-1 overflow-hidden rounded-full bg-border">
                <span className={cn("block h-full bg-primary transition-[width] duration-500 ease-out motion-reduce:transition-none", index <= current ? "w-full" : "w-0")} />
              </li>
            )}
            <li aria-current={active ? "step" : undefined} className="flex shrink-0 items-center gap-2">
              <span
                className={cn(
                  "grid size-7 place-items-center rounded-full text-sm font-bold transition-colors duration-300",
                  done || active ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground ring-1 ring-foreground/10"
                )}
              >
                {done ? <Check className="size-4" strokeWidth={3} /> : index + 1}
              </span>
              <span className={cn("text-sm font-semibold transition-colors", active ? "text-foreground" : "text-muted-foreground")}>{labels.steps[step]}</span>
            </li>
          </Fragment>
        );
      })}
    </ol>
  );
};

export default TripSteps;
