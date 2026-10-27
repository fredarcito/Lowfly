"use client";

import { useAdmin } from "@/components/admin/hooks/useAdmin";
import { ZOOMS } from "@/components/admin/data/zooms";

// A trend chart's figure at its zoom: its name, the total, the range ("Últimos 30 días"), and against the range
// before (when it was all counted, `previous` not null) and the average a day or a week. `write`: a value, in
// dollars with `money`; `writeChange`: the change against the range before (as `write` unless given: a share
// changes in points); `detail`: in place of the average (a share has none).
const TrendHeadline = ({ title, total, previous, points, zoom, write, writeChange = write, detail, money = false }) => {
  const { texts, format } = useAdmin();
  const change = previous === null ? null : total - previous;
  const changeText = change === null ? null : `${change > 0 ? "+" : change < 0 ? "−" : "±"}${writeChange(Math.abs(change))}`;
  const perPoint = total / points;
  const average = detail ?? texts.zoom.perPoint[ZOOMS[zoom].step > 1 ? "week" : "day"](money ? format.money(perPoint) : format.decimal(perPoint));
  return (
    <div className="grid gap-0.5">
      <p className="text-sm text-muted-foreground">{title}</p>
      <p className="font-heading text-3xl font-extrabold tracking-tight tabular-nums">{write(total)}</p>
      <p className="text-xs text-muted-foreground">{texts.zoom.total[zoom]}</p>
      <p className="text-xs text-muted-foreground tabular-nums">{[changeText && texts.zoom.versus[zoom](changeText), average].filter(Boolean).join(" · ")}</p>
    </div>
  );
};

export default TrendHeadline;
