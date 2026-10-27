"use client";

import { useState } from "react";
import { useAdmin } from "@/components/admin/hooks/useAdmin";
import ChartLegend from "@/components/admin/ChartLegend";
import LinePlot from "@/components/admin/LinePlot";
import TrendHeadline from "@/components/admin/TrendHeadline";
import ZoomPicker from "@/components/admin/ZoomPicker";
import { useUsageSeries } from "@/components/admin/AdminUsage/components/UsageTrend/hooks/useUsageSeries";
import { ZOOM_OPTIONS } from "@/components/admin/data/zooms";
import { cn } from "@/utils/cn";

const SERIES = ["sent", "problems", "unanswered"];

// How the requests to the airlines, the problems with them and the searches that ended badly move, one figure at a
// time and with its own zoom, apart from the page's period: the last week or month day by day, or the last year week
// by week. Its total (or share) against the range before, then the lines; the searches that ended badly as shares,
// with no results and with an error, with a legend. Screen readers get the same numbers as a table. (The searches'
// trend is on the overview.) `trend`: { since, sent, problems, unanswered }, server/admin/usage.
const UsageTrend = ({ trend }) => {
  const { texts: all } = useAdmin();
  const texts = all.usage;
  const [series, setSeries] = useState("sent");
  const [zoom, setZoom] = useState("month");
  const { points, lines, headline, write, writeTick, whole, labelOf, axisOf } = useUsageSeries(trend, series, zoom);

  return (
    <section className="grid min-w-0 content-start gap-5 rounded-xl bg-card p-5 ring-1 ring-foreground/10 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-heading text-lg font-bold">{texts.daily}</h2>
        <ZoomPicker zoom={zoom} zooms={ZOOM_OPTIONS} onChange={setZoom} />
      </div>
      <div role="tablist" aria-label={texts.daily} className="grid grid-cols-3 gap-1 rounded-lg bg-muted/60 p-1">
        {SERIES.map((option) => (
          <button
            key={option}
            type="button"
            role="tab"
            aria-selected={series === option}
            onClick={() => setSeries(option)}
            className={cn(
              "h-9 truncate rounded-md px-1 text-xs font-medium transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50 sm:text-sm",
              series === option ? "bg-selected text-primary-ink [-webkit-text-stroke:0.4px_currentColor]" : "text-muted-foreground hover:text-foreground"
            )}
          >
            {texts.series[option]}
          </button>
        ))}
      </div>
      <TrendHeadline title={texts.seriesTitle[series]} points={points.length} zoom={zoom} {...headline} />
      {lines.length > 1 && <ChartLegend lines={lines} />}

      <LinePlot points={points} lines={lines} whole={whole} write={write} writeTick={writeTick} labelOf={labelOf} axisOf={axisOf} />

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
                  <td key={line.key}>
                    {write(point[line.key])}
                    {line.noteOf && ` (${line.noteOf(point)})`}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default UsageTrend;
