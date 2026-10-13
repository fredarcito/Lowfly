"use client";

import { useState } from "react";
import { enGB, es } from "react-day-picker/locale";
import { CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { iso, nightsBetween, parseDay } from "@/lib/dates";
import { useI18n } from "@/components/I18nProvider";
import { cn } from "@/lib/utils";

// A single picker for a date range ("YYYY-MM-DD"). Closes itself once the second day is picked.
// `unit` decides how the length is counted: "days" for a search range, "nights" for a trip.
export default function DateRangeField({ id, from, to, onChange, minNights = 0, maxNights, unit = "days", className }) {
  const { lang, t, f } = useI18n();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(null);

  const committed = from && to ? { from: parseDay(from), to: parseDay(to) } : undefined;
  const selected = draft ?? committed;

  function onSelect(range, triggerDate) {
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
  }

  const n = from && to ? nightsBetween(from, to) : 0;
  const length = unit === "nights" ? t.units.nights(n) : t.units.days(n + 1);

  return (
    <Popover
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (!o) setDraft(null);
      }}
    >
      <PopoverTrigger asChild>
        <Button
          id={id}
          variant="outline"
          className={cn("h-11 w-full justify-start gap-2 px-3 text-left text-base font-normal md:text-sm", className)}
        >
          <CalendarDays className="text-muted-foreground" />
          {from && to ? (
            <span className="flex min-w-0 flex-1 items-center justify-between gap-2">
              <span className="truncate">
                {f.fmtDay(from)} → {f.fmtDay(to)}
              </span>
              <span className="shrink-0 text-xs text-muted-foreground">{length}</span>
            </span>
          ) : (
            <span className="text-muted-foreground">{t.picker.choose}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <p className="px-3 pt-3 text-sm text-muted-foreground">
          {draft?.from && !draft.to
            ? unit === "nights"
              ? t.picker.retDay
              : t.picker.lastDay
            : unit === "nights"
              ? t.picker.outDay
              : t.picker.firstDay}
        </p>
        <Calendar
          mode="range"
          locale={lang === "en" ? enGB : es}
          numberOfMonths={2}
          defaultMonth={selected?.from}
          selected={selected}
          onSelect={onSelect}
          min={minNights}
          max={maxNights}
          disabled={{ before: new Date() }}
          className="[--cell-size:--spacing(9)]"
        />
      </PopoverContent>
    </Popover>
  );
}
