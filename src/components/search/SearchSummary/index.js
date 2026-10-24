"use client";

import { useState } from "react";
import { ArrowRight, Check, Pencil, PlaneTakeoff, Share2 } from "lucide-react";
import { MODES } from "@/components/search/ModeTabs";
import { useI18n } from "@/context/i18n";
import { APP_NAME } from "@/i18n/config";
import { daysBetween } from "@/utils/dates";

// One line with the search that produced the results. Clicking it opens the form again;
// "Share" sends the link to this search (it is in the URL, see lib/share).
const SearchSummary = ({ query, originName, onEdit }) => {
  const { texts, format } = useI18n();
  const [copied, setCopied] = useState(false);
  if (!query) return null;

  const { mode, origin, country, city, from, to, ida, vuelta, flex, max, trip, minN, maxN, weekend, freeFrom, freeTo, passengers } = query;
  const ModeIcon = MODES.find((candidate) => candidate.id === mode).icon;
  const destination = { everywhere: texts.summary.anywhere, multiCity: texts.summary.multiCity }[mode] ?? (city || country);
  const route = `${originName ?? origin} → ${destination}`;
  const parts =
    mode === "trip"
      ? [`${format.fmtDay(ida)} → ${format.fmtDay(vuelta)}`, texts.form.flexOption(Number(flex))]
      : mode === "multiCity"
        ? [`${format.fmtDay(freeFrom)} → ${format.fmtDay(freeTo)}`, texts.summary.freeDays(daysBetween(freeFrom, freeTo).length)]
        : [
          `${format.fmtDay(from)} → ${format.fmtDay(to)}`,
          trip !== "return"
            ? texts.form.oneway
            : `${texts.form.roundTrip}, ${weekend ? texts.summary.weekends : texts.summary.stay(Number(minN), Number(maxN))}`,
          max && texts.summary.max(format.money(Number(max))),
        ];
  const detail = [...parts, Number(passengers) > 1 && texts.form.adultsCount(Number(passengers))].filter(Boolean).join(" · ");

  // On phones and tablets, the share sheet (WhatsApp, Messages…); on computers, the link is copied
  const share = async () => {
    const url = window.location.href;
    if (navigator.share && window.matchMedia("(pointer: coarse)").matches) {
      try {
        await navigator.share({ title: APP_NAME, text: `${route} · ${detail}`, url });
      } catch {} // closed without sharing
      return;
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={onEdit}
        className="group flex min-w-0 flex-1 items-center gap-3 rounded-lg text-left outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        {/* Small phones: without the mode's icon, so the route has room */}
        <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-muted text-primary max-[400px]:hidden">
          <ModeIcon className="size-4" />
        </span>
        {/* One column that can shrink: a long route is cut short ("…") instead of running under the buttons */}
        <span className="grid min-w-0 flex-1 grid-cols-1 gap-0.5">
          <span className="flex min-w-0 items-center gap-1.5 font-heading text-base font-semibold">
            <PlaneTakeoff className="size-4 shrink-0 text-muted-foreground" />
            {/* The origin whole (up to half the line); the destination is the one cut short */}
            <span className="max-w-1/2 shrink-0 truncate">{originName ?? origin}</span>
            <ArrowRight className="size-4 shrink-0 text-muted-foreground" />
            <span className="truncate">{destination}</span>
          </span>
          <span className="truncate text-sm text-muted-foreground">{detail}</span>
        </span>
        <span className="flex h-9 shrink-0 items-center gap-1.5 rounded-lg border px-3 text-sm font-medium transition-colors group-hover:bg-muted">
          <Pencil className="size-3.5" />
          <span className="sr-only sm:not-sr-only">{texts.summary.edit}</span>
        </span>
      </button>
      <button
        type="button"
        onClick={share}
        className="flex h-9 shrink-0 items-center gap-1.5 rounded-lg border px-3 text-sm font-medium transition-colors outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        {copied ? <Check className="size-3.5 text-save" /> : <Share2 className="size-3.5" />}
        <span className="sr-only sm:not-sr-only">{copied ? texts.summary.copied : texts.summary.share}</span>
      </button>
      <span className="sr-only" aria-live="polite">
        {copied ? texts.summary.copied : ""}
      </span>
    </div>
  );
};

export default SearchSummary;
