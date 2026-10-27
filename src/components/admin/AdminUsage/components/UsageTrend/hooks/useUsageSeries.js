import { useAdmin } from "@/components/admin/hooks/useAdmin";
import { useZoomed } from "@/components/admin/hooks/useZoomed";
import { OUTCOME_LINES } from "@/components/admin/data/colors";
import { zoomDates } from "@/components/admin/data/zooms";

const KEYS = { sent: ["value"], problems: ["value"], unanswered: ["value", "empty", "failed"] };
const OUTCOMES = ["empty", "failed"];

// `part` of `whole`, 0 when there is none
const shareOf = (part, whole) => (whole ? part / whole : 0);

// One of the usage trend's figures at a zoom, ready to draw: its points, lines, headline and how to write its values.
// Requests and problems are counts; the searches that ended badly, shares of that day's (or week's) searches, one
// line with no results and one with an error, their counts and their sum in the tooltip and the searches beside the
// date.
export const useUsageSeries = (trend, series, zoom) => {
  const { texts: all, format } = useAdmin();
  const texts = all.usage;
  const { points, totals, previous } = useZoomed(trend[series], KEYS[series], zoom, trend.since);
  const dates = zoomDates(zoom, format);
  if (series !== "unanswered") {
    return {
      points,
      lines: [{ key: "value", label: texts.seriesTitle[series], color: "var(--primary)", area: true }],
      headline: { total: totals.value, previous: previous?.value ?? null, write: format.count },
      write: format.count,
      writeTick: format.count,
      whole: true,
      ...dates,
    };
  }
  const shares = points.map((point) => ({
    ...point,
    emptyShare: shareOf(point.empty, point.value),
    failedShare: shareOf(point.failed, point.value),
    badShare: shareOf(point.empty + point.failed, point.value),
  }));
  const badShare = (sums) => shareOf(sums.empty + sums.failed, sums.value);
  return {
    points: shares,
    lines: OUTCOMES.map((outcome) => ({
      key: `${outcome}Share`,
      label: texts.columns[outcome],
      value: format.percent(shareOf(totals[outcome], totals.value)),
      noteOf: (point) => format.count(point[outcome]),
      ...OUTCOME_LINES[outcome],
    })),
    // Both ways of ending badly, together
    total: { key: "badShare", label: all.dashboard.legend.total, noteOf: (point) => format.count(point.empty + point.failed) },
    headline: {
      total: badShare(totals),
      // Against the range before, only when it had searches
      previous: previous?.value ? badShare(previous) : null,
      write: format.percent,
      writeChange: (change) => all.zoom.points(format.decimal(change * 100)),
      detail: texts.ofSearches(format.count(totals.value)),
    },
    write: format.percent,
    writeTick: format.percent,
    whole: false,
    labelOf: (point) => `${dates.labelOf(point)} · ${texts.searchCount(format.count(point.value))}`,
    axisOf: dates.axisOf,
  };
};
