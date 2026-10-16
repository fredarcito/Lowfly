"use client";

import { useState } from "react";
import { useAdmin } from "@/components/admin/hooks/useAdmin";
import { cn } from "@/utils/cn";

const SERIES = ["users", "itineraries", "cost"];
// Itineraries without an account, over the ones with one (coral): a sea blue checked against coral for colour
// blindness and on both themes' cards (dataviz validator)
const GUEST = "bg-[oklch(0.62_0.13_240)]";

// The top of the scale: the first 1, 2 or 5 (× 10ⁿ) at or over the highest value; whole for counts
const scaleTop = (highest, whole) => {
  if (highest <= 0) return whole ? 1 : 0.01;
  const power = 10 ** Math.floor(Math.log10(highest));
  const top = [1, 2, 5, 10].find((step) => step * power >= highest) * power;
  return whole ? Math.max(1, Math.ceil(top)) : top;
};

// Labels near an edge line up with it instead of centring, so they stay in the card
const anchorOf = (index, count) => (index < count * 0.2 ? "left-0" : index > count * 0.8 ? "right-0" : "left-1/2 -translate-x-1/2");

// The period day by day, one figure at a time (sign-ups, itineraries or AI cost: each with its own scale and
// unit, never two on one axis): its total, then a bar per day over a scale with guide lines. Itineraries split
// each bar: with an account (coral, below) and without (blue, on top), with a legend. Hovering a bar shows its day
// and value; screen readers get the same numbers as a table. `daily`: { users, itineraries, cost } of
// [{ day, value }] (itineraries also `guests`).
const DailyChart = ({ daily }) => {
  const { texts: all, format } = useAdmin();
  const texts = all.dashboard;
  const [series, setSeries] = useState("itineraries");
  const days = daily[series];
  const money = series === "cost";
  const write = money ? format.money : format.count;
  const writeTick = money ? format.moneyScale : format.count;
  const top = scaleTop(Math.max(...days.map((entry) => entry.value)), !money);
  const half = top / 2;
  const ticks = money || Number.isInteger(half) ? [top, half, 0] : [top, 0];
  const total = days.reduce((sum, entry) => sum + entry.value, 0);
  const split = series === "itineraries";

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
        <p className="font-heading text-3xl font-extrabold tracking-tight tabular-nums">{write(total)}</p>
        <p className="text-xs text-muted-foreground">{texts.periodTotal}</p>
      </div>
      {split && (
        <ul className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
          <li className="flex items-center gap-1.5">
            <span aria-hidden className="size-2.5 rounded-sm bg-primary" /> {texts.legend.account}
          </li>
          <li className="flex items-center gap-1.5">
            <span aria-hidden className={cn("size-2.5 rounded-sm", GUEST)} /> {texts.legend.guest}
          </li>
        </ul>
      )}

      <div aria-hidden className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-3">
        {/* The scale: its values beside guide lines across the bars. The widest value, hidden, sizes the column (the
            placed ones take no room), so the labels stay in the card */}
        <div className="relative h-44 text-right text-xs text-muted-foreground tabular-nums">
          <span className="invisible block whitespace-nowrap">{writeTick(top)}</span>
          {ticks.map((tick) => (
            <span key={tick} className="absolute right-0 -translate-y-1/2 whitespace-nowrap" style={{ top: `${(1 - tick / top) * 100}%` }}>
              {writeTick(tick)}
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
                {/* Split: without an account on top (rounded), with one below, 2px of card between them */}
                <div
                  className="flex w-full flex-col justify-end gap-[2px] transition-opacity group-hover:opacity-80"
                  style={{ height: `${entry.value ? Math.max((entry.value / top) * 100, 1.5) : 0}%` }}
                >
                  {split && entry.guests > 0 && <div className={cn("min-h-px rounded-t-[4px]", GUEST)} style={{ flex: entry.guests }} />}
                  {(!split || entry.value > entry.guests) && (
                    <div
                      className={cn("min-h-px bg-primary", !(split && entry.guests > 0) && "rounded-t-[4px]")}
                      style={{ flex: split ? entry.value - entry.guests : 1 }}
                    />
                  )}
                </div>
                <span
                  className={cn(
                    "pointer-events-none absolute bottom-full z-10 mb-1 hidden rounded-md bg-popover px-2 py-1 text-xs whitespace-nowrap text-popover-foreground shadow-md ring-1 ring-foreground/10 group-hover:block",
                    anchorOf(index, days.length)
                  )}
                >
                  {format.day(entry.day)} · <span className="font-semibold tabular-nums">{write(entry.value)}</span>
                  {split && entry.value > 0 && (
                    <span className="block text-muted-foreground tabular-nums">
                      {texts.legend.account} {entry.value - entry.guests} · {texts.legend.guest} {entry.guests}
                    </span>
                  )}
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
              {split && <th scope="col">{texts.legend.guest}</th>}
            </tr>
          </thead>
          <tbody>
            {days.map((entry) => (
              <tr key={entry.day}>
                <td>{format.day(entry.day)}</td>
                <td>{write(entry.value)}</td>
                {split && <td>{entry.guests}</td>}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default DailyChart;
