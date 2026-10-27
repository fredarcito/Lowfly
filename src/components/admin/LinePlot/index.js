"use client";

import { scaleTop } from "@/components/admin/LinePlot/data/scale";
import { cn } from "@/utils/cn";

// Points shown always up to this many (a week); more, only the hovered one
const ALWAYS_DOTS = 7;

// Labels near an edge line up with it instead of centring, so they stay in the card
const anchorOf = (index, count) => (index < count * 0.2 ? "left-0" : index > count * 0.8 ? "right-0" : "left-1/2 -translate-x-1/2");

// A trend's points as lines over one scale with guide lines, the first on top (with `area`, a soft fill under it).
// Hovering a point marks it on every line and shows its date and each line's value. `points`: [{ from, …keys }];
// `lines`: [{ key, label, color, dash?, area?, noteOf? }] (`noteOf(point)`: beside its value in the tooltip, as a
// share's count); `write`/`writeTick`: a value in the tooltip / on the scale (`whole` false for dollars or shares);
// `labelOf(point)`: its date for the tooltip; `axisOf(point, last)`: for the dates under the lines.
const LinePlot = ({ points, lines, whole = true, write, writeTick, labelOf, axisOf }) => {
  const top = scaleTop(Math.max(...lines.flatMap((line) => points.map((point) => point[line.key]))), whole);
  const half = top / 2;
  const ticks = !whole || Number.isInteger(half) ? [top, half, 0] : [top, 0];
  const count = points.length;
  const xOf = (index) => (index / (count - 1)) * 100;
  const yOf = (value) => (1 - value / top) * 100;
  const pathOf = (key) => points.map((point, index) => `${index ? "L" : "M"}${xOf(index)},${yOf(point[key])}`).join(" ");
  const dots = count <= ALWAYS_DOTS;
  const single = lines.length === 1;

  return (
    <div aria-hidden className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-3">
      {/* The scale: its values beside guide lines across the plot. The widest value, hidden, sizes the column (the
          placed ones take no room), so the labels stay in the card */}
      <div className="relative h-48 text-right text-xs text-muted-foreground tabular-nums">
        <span className="invisible block whitespace-nowrap">{writeTick(top)}</span>
        {ticks.map((tick) => (
          <span key={tick} className="absolute right-0 -translate-y-1/2 whitespace-nowrap" style={{ top: `${yOf(tick)}%` }}>
            {writeTick(tick)}
          </span>
        ))}
      </div>
      <div className="relative h-48 border-b border-foreground/20">
        {ticks.slice(0, -1).map((tick) => (
          <span key={tick} className="absolute inset-x-0 border-t border-dashed border-foreground/10" style={{ top: `${yOf(tick)}%` }} />
        ))}
        {/* Stretched to the plot: the strokes keep their 2px (and dashes) however wide it is */}
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 size-full overflow-visible">
          {lines
            .filter((line) => line.area)
            .map((line) => (
              <path key={`${line.key}-area`} d={`${pathOf(line.key)} L100,100 L0,100 Z`} style={{ fill: line.color, fillOpacity: 0.1 }} />
            ))}
          {lines.toReversed().map((line) => (
            <path
              key={line.key}
              d={pathOf(line.key)}
              fill="none"
              strokeWidth={2}
              strokeLinejoin="round"
              strokeLinecap="round"
              strokeDasharray={line.dash ? "5 4" : undefined}
              vectorEffect="non-scaling-stroke"
              style={{ stroke: line.color }}
            />
          ))}
        </svg>
        {/* A hover target per point, as wide as the space between it and its neighbours */}
        {points.map((point, index) => {
          const start = Math.max(0, xOf(index - 0.5));
          const end = Math.min(100, xOf(index + 0.5));
          const left = `${((xOf(index) - start) / (end - start)) * 100}%`;
          return (
            <div key={point.from} className="group absolute inset-y-0" style={{ left: `${start}%`, width: `${end - start}%` }}>
              <span className="absolute inset-y-0 hidden border-l border-foreground/25 group-hover:block" style={{ left }} />
              {lines.toReversed().map((line) => (
                <span
                  key={line.key}
                  className={cn("absolute size-2 -translate-x-1/2 -translate-y-1/2 rounded-full ring-2 ring-card", !dots && "hidden group-hover:block")}
                  style={{ left, top: `${yOf(point[line.key])}%`, background: line.color }}
                />
              ))}
              <span
                className={cn(
                  "pointer-events-none absolute bottom-full z-10 mb-1 hidden rounded-md bg-popover px-2 py-1 text-xs whitespace-nowrap text-popover-foreground shadow-md ring-1 ring-foreground/10 group-hover:grid",
                  anchorOf(index, count)
                )}
              >
                <span>
                  {labelOf(point)}
                  {single && (
                    <>
                      {" · "}
                      <span className="font-semibold tabular-nums">{write(point[lines[0].key])}</span>
                    </>
                  )}
                </span>
                {!single &&
                  lines.map((line) => (
                    <span key={line.key} className="flex items-center gap-1.5 text-muted-foreground">
                      <span className={cn("w-2.5 border-t-2", line.dash && "border-dashed")} style={{ borderColor: line.color }} />
                      {line.label}
                      <span className="ml-auto pl-3 font-semibold text-popover-foreground tabular-nums">
                        {write(point[line.key])}
                        {line.noteOf && <span className="font-normal text-muted-foreground"> · {line.noteOf(point)}</span>}
                      </span>
                    </span>
                  ))}
              </span>
            </div>
          );
        })}
      </div>
      <span />
      <div className="flex justify-between pt-2 text-xs text-muted-foreground">
        <span>{axisOf(points[0], false)}</span>
        <span>{axisOf(points.at(-1), true)}</span>
      </div>
    </div>
  );
};

export default LinePlot;
