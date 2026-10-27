"use client";

import { useState } from "react";
import { useAdmin } from "@/components/admin/hooks/useAdmin";
import { useZoomed } from "@/components/admin/hooks/useZoomed";
import ChartLegend from "@/components/admin/ChartLegend";
import LinePlot from "@/components/admin/LinePlot";
import TrendHeadline from "@/components/admin/TrendHeadline";
import ZoomPicker from "@/components/admin/ZoomPicker";
import { GUEST, SEARCH_MODE_LINES } from "@/components/admin/data/colors";
import { ZOOM_OPTIONS, zoomDates } from "@/components/admin/data/zooms";
import { SEARCH_MODES } from "@/constants/metrics";
import { cn } from "@/utils/cn";

const SERIES = ["users", "itineraries", "searches", "cost"];
const KEYS = { users: ["value"], itineraries: ["value", "guests"], searches: ["value", ...SEARCH_MODES], cost: ["value"] };

// How sign-ups, itineraries, searches or AI cost move, one figure at a time (each with its own scale and unit, never
// two on one axis) and with its own zoom, apart from the page's period: the last week or month day by day, or the last
// year week by week. Its total against the range before and the average, then the line; itineraries add a line for
// the ones without an account, and searches get a line per kind (each always in its colour) with the kind's total in
// the legend, to see which is used most. Screen readers get the same numbers as a table.
// `trend`: { since (per figure), users, itineraries, searches, cost } of [{ day, value }] (itineraries also `guests`,
// searches also by kind; none without Redis), server/admin/stats.
const TrendChart = ({ trend }) => {
  const { texts: all, format } = useAdmin();
  const texts = all.dashboard;
  const seriesShown = SERIES.filter((option) => trend[option]);
  const [series, setSeries] = useState("itineraries");
  const [zoom, setZoom] = useState("month");
  const { points, totals, previous } = useZoomed(trend[series], KEYS[series], zoom, trend.since[series]);
  const money = series === "cost";
  const write = money ? format.money : format.count;
  const split = series === "itineraries";
  const byMode = series === "searches";
  const { labelOf, axisOf } = zoomDates(zoom, format);
  const lines = split
    ? [
        { key: "value", label: texts.legend.total, color: "var(--primary)", area: true },
        { key: "guests", label: texts.legend.guest, color: GUEST },
      ]
    : byMode
      ? SEARCH_MODES.map((mode) => ({ key: mode, label: all.usage.modes[mode], value: format.count(totals[mode]), ...SEARCH_MODE_LINES[mode] }))
      : [{ key: "value", label: texts.seriesTitle[series], color: "var(--primary)", area: true }];

  return (
    <section className="grid min-w-0 content-start gap-5 rounded-xl bg-card p-5 ring-1 ring-foreground/10 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-heading text-lg font-bold">{texts.daily}</h2>
        <ZoomPicker zoom={zoom} zooms={ZOOM_OPTIONS} onChange={setZoom} />
      </div>
      <div
        role="tablist"
        aria-label={texts.daily}
        className="grid gap-1 rounded-lg bg-muted/60 p-1"
        style={{ gridTemplateColumns: `repeat(${seriesShown.length}, minmax(0, 1fr))` }}
      >
        {seriesShown.map((option) => (
          <button
            key={option}
            type="button"
            role="tab"
            aria-selected={series === option}
            onClick={() => setSeries(option)}
            className={cn(
              "h-9 truncate rounded-md px-1 text-xs font-medium transition-colors sm:text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
              series === option ? "bg-selected text-primary-ink [-webkit-text-stroke:0.4px_currentColor]" : "text-muted-foreground hover:text-foreground"
            )}
          >
            {texts.series[option]}
          </button>
        ))}
      </div>
      <TrendHeadline
        title={texts.seriesTitle[series]}
        total={totals.value}
        previous={previous?.value ?? null}
        points={points.length}
        zoom={zoom}
        write={write}
        money={money}
      />
      {(split || byMode) && <ChartLegend lines={lines} />}

      <LinePlot
        points={points}
        lines={lines}
        whole={!money}
        write={write}
        writeTick={money ? format.moneyScale : format.count}
        labelOf={labelOf}
        axisOf={axisOf}
      />

      {/* A table ignores the 1px box of sr-only: its wrapper hides it */}
      <div className="sr-only">
        <table>
          <caption>
            {texts.seriesTitle[series]} · {all.zoom.total[zoom]}
          </caption>
          <thead>
            <tr>
              <th scope="col">{all.zoom.date}</th>
              {lines.map((line) => (
                <th key={line.key} scope="col">
                  {line.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {points.map((point) => (
              <tr key={point.from}>
                <td>{labelOf(point)}</td>
                {lines.map((line) => (
                  <td key={line.key}>{write(point[line.key])}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default TrendChart;
