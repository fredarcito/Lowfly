"use client";

import { useState, useSyncExternalStore } from "react";
import { enGB, es } from "react-day-picker/locale";
import { CalendarDays, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { iso, nightsBetween, parseDay } from "@/lib/dates";
import { useI18n } from "@/components/I18nProvider";
import { cn } from "@/lib/utils";

// Two months side by side only fit from md up; below that the picker is a bottom sheet with one month
const DESKTOP = "(min-width: 768px)";
const subscribe = (cb) => {
  const mq = window.matchMedia(DESKTOP);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
};
const useDesktop = () =>
  useSyncExternalStore(subscribe, () => window.matchMedia(DESKTOP).matches, () => true);

// A single picker for a date range ("YYYY-MM-DD"). Closes itself once the second day is picked.
// `unit` decides how the length is counted: "days" for a search range, "nights" for a trip.
export default function DateRangeField({ id, from, to, onChange, minNights = 0, maxNights, unit = "days", className }) {
  const { lang, t, f } = useI18n();
  const desktop = useDesktop();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(null);

  const committed = from && to ? { from: parseDay(from), to: parseDay(to) } : undefined;
  const selected = draft ?? committed;
  const picking = draft?.from && !draft.to ? "end" : "start";

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

  const onOpenChange = (o) => {
    setOpen(o);
    if (!o) setDraft(null);
  };

  const n = from && to ? nightsBetween(from, to) : 0;
  const length = unit === "nights" ? t.units.nights(n) : t.units.days(n + 1);
  const prompt =
    picking === "end"
      ? unit === "nights"
        ? t.picker.retDay
        : t.picker.lastDay
      : unit === "nights"
        ? t.picker.outDay
        : t.picker.firstDay;

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
            {f.fmtDay(from)} → {f.fmtDay(to)}
          </span>
          <span className="shrink-0 text-xs text-muted-foreground">{length}</span>
        </span>
      ) : (
        <span className="text-muted-foreground">{t.picker.choose}</span>
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
      disabled={{ before: new Date() }}
      // Days of the neighbour month would show the same date twice
      showOutsideDays={false}
      {...props}
    />
  );

  if (desktop) {
    return (
      <Popover open={open} onOpenChange={onOpenChange}>
        <PopoverTrigger asChild>{trigger}</PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <p className="px-3 pt-3 text-sm text-muted-foreground">{prompt}</p>
          {calendar({ numberOfMonths: 2, className: "[--cell-size:--spacing(9)]" })}
        </PopoverContent>
      </Popover>
    );
  }

  // Mobile: what is already picked, which end is being chosen, and one large month
  const ends = [
    { key: "start", label: unit === "nights" ? t.results.out : t.picker.start, day: selected?.from },
    { key: "end", label: unit === "nights" ? t.results.ret : t.picker.end, day: selected?.to },
  ];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetTrigger asChild>{trigger}</SheetTrigger>
      <SheetContent>
        <div className="mx-auto grid w-full max-w-md gap-4 px-4 pt-3">
          <div className="flex items-center justify-between gap-3">
            <SheetTitle>{prompt}</SheetTitle>
            <SheetClose asChild>
              <Button variant="ghost" size="icon" className="-mr-2 size-9" aria-label={t.picker.close}>
                <X />
              </Button>
            </SheetClose>
          </div>
          <SheetDescription className="sr-only">{t.picker.choose}</SheetDescription>
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
                <span className="font-semibold">{day ? f.fmtDay(iso(day)) : "—"}</span>
              </div>
            ))}
          </div>
          {calendar({
            numberOfMonths: 1,
            className: "-mx-2 bg-transparent p-0 [--cell-size:--spacing(10)]",
            classNames: { root: "w-[calc(100%+1rem)]" },
          })}
        </div>
      </SheetContent>
    </Sheet>
  );
}
