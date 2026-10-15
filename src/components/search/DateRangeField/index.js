"use client";

import { useState } from "react";
import { enGB, es } from "react-day-picker/locale";
import { CalendarDays, ChevronDown } from "lucide-react";
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
// `split`: the two ends as two fields side by side, each with its label, opening the calendar on its own end.
const DateRangeField = ({ id, from, to, onChange, minNights = 0, maxNights, unit = "days", labels, minDay, split = false, className }) => {
  const { lang, texts, format } = useI18n();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(null);

  const committed = from && to ? { from: parseDay(from), to: parseDay(to) } : undefined;
  const selected = draft ?? committed;
  const picking = draft?.from && !draft.to ? "end" : "start";

  const commit = (first, last) => {
    onChange(iso(first), iso(last));
    setDraft(null);
    setOpen(false);
  };

  const onSelect = (range, triggerDate) => {
    // Split, picking the departure: the day clicked (days before the arrival cannot be clicked)
    if (split && draft?.from && !draft.to) {
      commit(draft.from, triggerDate);
      return;
    }
    // With a complete range, the first click starts a new one
    if (!draft) {
      setDraft({ from: triggerDate, to: undefined });
      return;
    }
    if (!range?.from || !range?.to) {
      setDraft(range ?? { from: triggerDate, to: undefined });
      return;
    }
    commit(range.from, range.to);
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

  // Split: "Arrival [15 Oct ⌄]  Departure [17 Oct ⌄]", one calendar for both. Each opens it on its own end:
  // arrival (then departure follows), or departure with the arrival kept (only days from it can be picked).
  // The end being picked is outlined in coral while the calendar is open.
  const openAt = (end) => (event) => {
    // The wrapper is the picker's anchor: opened here, on the right end, not toggled by it
    event.preventDefault();
    event.stopPropagation();
    setDraft(end === "end" && from ? { from: parseDay(from), to: undefined } : null);
    setOpen(true);
  };

  const splitTrigger = (
    <div className={cn("grid w-full grid-cols-2 gap-3", className)}>
      {[
        { key: "start", label: endTexts.start, day: from, buttonId: id },
        { key: "end", label: endTexts.end, day: to, buttonId: `${id}-end` },
      ].map(({ key, label, day, buttonId }) => (
        <span key={key} className="grid min-w-0 gap-1.5">
          <label htmlFor={buttonId} className="text-sm font-medium">
            {label}
          </label>
          <button
            id={buttonId}
            type="button"
            onClick={openAt(key)}
            aria-haspopup="dialog"
            className={cn(
              "flex h-11 min-w-0 items-center gap-2 rounded-lg border bg-background px-3 text-left transition-[border-color,box-shadow] duration-200 outline-none hover:border-foreground/25 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30",
              open && picking === key && "border-primary ring-3 ring-primary/25 hover:border-primary"
            )}
          >
            {/* Phones: without the icon, so the whole day fits in half the width */}
            <CalendarDays className="size-4 shrink-0 text-muted-foreground max-sm:hidden" />
            {/* The day fades in when it changes */}
            <span key={day ?? "none"} className={cn("min-w-0 flex-1 truncate duration-300 animate-in fade-in motion-reduce:animate-none", !day && "text-muted-foreground")}>
              {day ? format.fmtDay(day) : "—"}
            </span>
            <ChevronDown className={cn("size-4 shrink-0 text-muted-foreground transition-transform duration-200", open && picking === key && "rotate-180")} />
          </button>
        </span>
      ))}
    </div>
  );

  const trigger = split ? splitTrigger : (
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
      // The month of what is picked, or else of the first day that can be (a town after another: its month)
      defaultMonth={selected?.from ?? (minDay ? parseDay(minDay) : undefined)}
      selected={selected}
      onSelect={onSelect}
      min={minNights}
      max={maxNights}
      // Split, picking the departure: nothing before the arrival
      disabled={{ before: split && picking === "end" && draft?.from ? draft.from : minDay ? parseDay(minDay) : new Date() }}
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
