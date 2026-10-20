"use client";

import { useState } from "react";
import { useAdmin } from "@/components/admin/hooks/useAdmin";
import { cn } from "@/utils/cn";

const SERIES = ["searches", "sent", "problems"];

// The top of the scale: the first 1, 2 or 5 (× 10ⁿ) at or over the highest count
const scaleTop = (highest) => {
  if (highest <= 0) return 1;
  const power = 10 ** Math.floor(Math.log10(highest));
  return Math.max(1, Math.ceil([1, 2, 5, 10].find((step) => step * power >= highest) * power));
};

// Labels near an edge line up with it instead of centring, so they stay in the card
const anchorOf = (index, count) => (index < count * 0.2 ? "left-0" : index > count * 0.8 ? "right-0" : "left-1/2 -translate-x-1/2");

// The period day by day, one count at a time (searches, requests to the airlines, or problems with them): its total,
// then a bar per day over a scale with guide lines, as the overview's chart. Hovering a bar shows its day and count;
// screen readers get the same numbers as a table. `daily`: { searches, sent, problems } of [{ day, value }].
const UsageDaily = ({ daily }) => {
  const { texts: all, format } = useAdmin();
  const texts = all.usage;
  const [series, setSeries] = useState("searches");
  const days = daily[series];
  const top = scaleTop(Math.max(...days.map((entry) => entry.value)));
  const half = top / 2;
  const ticks = Number.isInteger(half) ? [top, half, 0] : [top, 0];
  const total = days.reduce((sum, entry) => sum + entry.value, 0);

  return (
    <section className="grid min-w-0 content-start gap-5 rounded-xl bg-card p-5 ring-1 ring-foreground/10 sm:p-6">
      <h2 className="font-heading text-lg font-bold">{texts.daily}</h2>
      <div role="tablist" aria-label={texts.daily} className="grid grid-cols-3 gap-1 rounded-lg bg-muted/60 p-1">
        {SERIES.map((option) => (
          <button
            key={option}
            type="button"
            role="tab"
            aria-selected={series === option}
            onClick={() => setSeries(option)}
            className={cn(
              "h-9 rounded-md text-sm font-medium transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
              series === option ? "bg-selected text-primary-ink [-webkit-text-stroke:0.4px_currentColor]" : "text-muted-foreground hover:text-foreground"
            )}
          >
            {texts.series[option]}
          </button>
        ))}
      </div>
      <div className="grid gap-0.5">
        <p className="text-sm text-muted-foreground">{texts.seriesTitle[series]}</p>
        <p className="font-heading text-3xl font-extrabold tracking-tight tabular-nums">{format.count(total)}</p>
        <p className="text-xs text-muted-foreground">{texts.periodTotal}</p>
      </div>

      <div aria-hidden className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-3">
        <div className="relative h-44 text-right text-xs text-muted-foreground tabular-nums">
          <span className="invisible block whitespace-nowrap">{format.count(top)}</span>
          {ticks.map((tick) => (
            <span key={tick} className="absolute right-0 -translate-y-1/2 whitespace-nowrap" style={{ top: `${(1 - tick / top) * 100}%` }}>
              {format.count(tick)}
            </span>
          ))}
        </div>
        <div className="relative h-44 border-b border-foreground/20">
          {ticks.slice(0, -1).map((tick) => (
            <span key={tick} className="absolute inset-x-0 border-t border-dashed border-foreground/10" style={{ top: `${(1 - tick / top) * 100}%` }} />
          ))}
          <div className="absolute inset-0 flex items-end gap-0.5">
            {days.map((entry, index) => (
              <div key={entry.day} className="group relative flex h-full min-w-0 flex-1 items-end">
                <div
                  className="w-full rounded-t-[4px] bg-primary transition-opacity group-hover:opacity-80"
                  style={{ height: `${entry.value ? Math.max((entry.value / top) * 100, 1.5) : 0}%` }}
                />
                <span
                  className={cn(
                    "pointer-events-none absolute bottom-full z-10 mb-1 hidden rounded-md bg-popover px-2 py-1 text-xs whitespace-nowrap text-popover-foreground shadow-md ring-1 ring-foreground/10 group-hover:block",
                    anchorOf(index, days.length)
                  )}
                >
                  {format.day(entry.day)} · <span className="font-semibold tabular-nums">{format.count(entry.value)}</span>
                </span>
              </div>
            ))}
          </div>
        </div>
        <span />
        <div className="flex justify-between pt-2 text-xs text-muted-foreground">
          <span>{format.day(days[0].day)}</span>
          <span>{format.day(days.at(-1).day)}</span>
        </div>
      </div>

      {/* A table ignores the 1px box of sr-only: its wrapper hides it */}
      <div className="sr-only">
        <table>
          <caption>{texts.seriesTitle[series]}</caption>
          <thead>
            <tr>
              <th scope="col">{texts.day}</th>
              <th scope="col">{texts.value}</th>
            </tr>
          </thead>
          <tbody>
            {days.map((entry) => (
              <tr key={entry.day}>
                <td>{format.day(entry.day)}</td>
                <td>{format.count(entry.value)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default UsageDaily;
