"use client";

import { ArrowRight, Pencil, PlaneTakeoff } from "lucide-react";
import { MODES } from "@/components/ModeTabs";
import { useI18n } from "@/components/I18nProvider";

// One line with the search that produced the results. Clicking it opens the form again.
export default function SearchSummary({ query, onEdit }) {
  const { t, f } = useI18n();
  if (!query) return null;

  const { mode, origin, originName, country, from, to, ida, vuelta, flex, max, trip, minN, maxN } = query;
  const ModeIcon = MODES.find((m) => m.id === mode).icon;
  const parts =
    mode === "trip"
      ? [`${f.fmtDay(ida)} → ${f.fmtDay(vuelta)}`, t.form.flexOption(Number(flex))]
      : [
          `${f.fmtDay(from)} → ${f.fmtDay(to)}`,
          trip === "return" ? `${t.form.roundTrip}, ${t.summary.stay(Number(minN), Number(maxN))}` : t.form.oneway,
          max && t.summary.max(f.money(Number(max))),
        ];

  return (
    <button
      type="button"
      onClick={onEdit}
      className="group flex w-full items-center gap-3 rounded-lg text-left outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
    >
      <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-muted text-primary">
        <ModeIcon className="size-4" />
      </span>
      <span className="grid min-w-0 flex-1 gap-0.5">
        <span className="flex items-center gap-1.5 font-heading text-base font-semibold">
          <PlaneTakeoff className="size-4 text-muted-foreground" />
          <span className="truncate">{originName ?? origin}</span>
          <ArrowRight className="size-4 text-muted-foreground" />
          <span className="truncate">{mode === "everywhere" ? t.summary.anywhere : country}</span>
        </span>
        <span className="truncate text-sm text-muted-foreground">{parts.filter(Boolean).join(" · ")}</span>
      </span>
      <span className="flex h-9 shrink-0 items-center gap-1.5 rounded-lg border px-3 text-sm font-medium transition-colors group-hover:bg-muted">
        <Pencil className="size-3.5" />
        <span className="sr-only sm:not-sr-only">{t.summary.edit}</span>
      </span>
    </button>
  );
}
