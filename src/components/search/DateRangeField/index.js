"use client";

import { useState } from "react";
import { enGB, es } from "react-day-picker/locale";
import { CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { iso, nightsBetween, parseDay } from "@/utils/dates";
import ResponsivePicker from "@/components/shared/ResponsivePicker";
import { useI18n } from "@/context/i18n";
import { cn } from "@/utils/cn";

// What the two ends are called and what to pick next, by how the range is counted
const unitTexts = (texts) => ({
  nights: { start: texts.results.out, end: texts.results.ret, pickStart: texts.picker.outDay, pickEnd: texts.picker.retDay },
  days: { start: texts.picker.start, end: texts.picker.end, pickStart: texts.picker.firstDay, pickEnd: texts.picker.lastDay },
});

// A single picker for a date range ("YYYY-MM-DD"). Closes itself once the second day is picked.
// `unit` decides how the length is counted: "days" for a search range, "nights" for a trip.
// `labels` ({ start, end, pickStart, pickEnd }) rename the two ends and what to pick (a trip planned by hand:
// arrival and departure); `minDay` ("YYYY-MM-DD") is the first day that can be picked (default: today).
const DateRangeField = ({ id, from, to, onChange, minNights = 0, maxNights, unit = "days", labels, minDay, className }) => {
  const { lang, texts, format } = useI18n();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(null);

  const committed = from && to ? { from: parseDay(from), to: parseDay(to) } : undefined;
  const selected = draft ?? committed;
  const picking = draft?.from && !draft.to ? "end" : "start";

  const onSelect = (range, triggerDate) => {
    // With a complete range, the first click starts a new one
    if (!draft) {
      setDraft({ from: triggerDate, to: undefined });
      return;
    }
    if (!range?.from || !range?.to) {
      setDraft(range ?? { from: triggerDate, to: undefined });
      return;
    }
    onChange(iso(range.from), iso(range.to));
    setDraft(null);
    setOpen(false);
  };

  const onOpenChange = (isOpen) => {
    setOpen(isOpen);
    if (!isOpen) setDraft(null);
  };

  const nights = from && to ? nightsBetween(from, to) : 0;
  const length = unit === "nights" ? texts.units.nights(nights) : texts.units.days(nights + 1);
  // The ends' names and what to pick: the unit's own, unless `labels` renames them
  const endTexts = { ...unitTexts(texts)[unit], ...labels };
  const prompt = endTexts[picking === "end" ? "pickEnd" : "pickStart"];

  const trigger = (
    <Button
      id={id}
      variant="outline"
      className={cn("h-11 w-full justify-start gap-2 px-3 text-left text-base font-normal md:text-sm", className)}
    >
      <CalendarDays className="text-muted-foreground" />
      {from && to ? (
        <span className="flex min-w-0 flex-1 items-center justify-between gap-2">
          <span className="truncate">
            {format.fmtDay(from)} → {format.fmtDay(to)}
          </span>
          <span className="shrink-0 text-xs text-muted-foreground">{length}</span>
        </span>
      ) : (
        <span className="text-muted-foreground">{texts.picker.choose}</span>
      )}
    </Button>
  );

  const calendar = (props) => (
    <Calendar
      mode="range"
      locale={lang === "en" ? enGB : es}
      defaultMonth={selected?.from}
      selected={selected}
      onSelect={onSelect}
      min={minNights}
      max={maxNights}
      disabled={{ before: minDay ? parseDay(minDay) : new Date() }}
      // Days of the neighbour month would show the same date twice
      showOutsideDays={false}
      {...props}
    />
  );

  // Mobile: what is already picked, which end is being chosen, and one large month
  const ends = [
    { key: "start", label: endTexts.start, day: selected?.from },
    { key: "end", label: endTexts.end, day: selected?.to },
  ];

  return (
    <ResponsivePicker open={open} onOpenChange={onOpenChange} trigger={trigger} title={prompt} description={texts.picker.choose} popoverClassName="w-auto p-0">
      {(desktop) =>
        desktop ? (
          <>
            <p className="px-3 pt-3 text-sm text-muted-foreground">{prompt}</p>
            {calendar({ numberOfMonths: 2, className: "[--cell-size:--spacing(9)]" })}
          </>
        ) : (
          <div className="mx-auto grid w-full max-w-md gap-4 px-4">
            <div className="grid grid-cols-2 gap-2">
              {ends.map(({ key, label, day }) => (
                <div
                  key={key}
                  className={cn(
                    "grid gap-0.5 rounded-lg px-3 py-2 ring-1 ring-foreground/10 transition-colors",
                    picking === key && "bg-muted ring-2 ring-primary"
                  )}
                >
                  <span className="text-xs text-muted-foreground">{label}</span>
                  <span className="font-semibold">{day ? format.fmtDay(iso(day)) : "—"}</span>
                </div>
              ))}
            </div>
            {calendar({
              numberOfMonths: 1,
              className: "-mx-2 bg-transparent p-0 [--cell-size:--spacing(10)]",
              classNames: { root: "w-[calc(100%+1rem)]" },
            })}
          </div>
        )
      }
    </ResponsivePicker>
  );
};

export default DateRangeField;
