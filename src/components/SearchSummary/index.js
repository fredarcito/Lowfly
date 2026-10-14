"use client";

import { useState } from "react";
import { ArrowRight, Check, Pencil, PlaneTakeoff, Share2 } from "lucide-react";
import { MODES } from "@/components/ModeTabs";
import { useI18n } from "@/context/i18n";
import { APP_NAME } from "@/i18n/config";

// One line with the search that produced the results. Clicking it opens the form again;
// "Share" sends the link to this search (it is in the URL, see lib/share).
export default function SearchSummary({ query, originName, onEdit }) {
  const { t, f } = useI18n();
  const [copied, setCopied] = useState(false);
  if (!query) return null;

  const { mode, origin, country, from, to, ida, vuelta, flex, max, trip, minN, maxN, weekend } = query;
  const ModeIcon = MODES.find((m) => m.id === mode).icon;
  const route = `${originName ?? origin} → ${mode === "everywhere" ? t.summary.anywhere : country}`;
  const parts =
    mode === "trip"
      ? [`${f.fmtDay(ida)} → ${f.fmtDay(vuelta)}`, t.form.flexOption(Number(flex))]
      : [
          `${f.fmtDay(from)} → ${f.fmtDay(to)}`,
          trip !== "return"
            ? t.form.oneway
            : `${t.form.roundTrip}, ${weekend ? t.summary.weekends : t.summary.stay(Number(minN), Number(maxN))}`,
          max && t.summary.max(f.money(Number(max))),
        ];
  const detail = parts.filter(Boolean).join(" · ");

  // On phones and tablets, the share sheet (WhatsApp, Messages…); on computers, the link is copied
  async function share() {
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
  }

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={onEdit}
        className="group flex min-w-0 flex-1 items-center gap-3 rounded-lg text-left outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-muted text-primary">
          <ModeIcon className="size-4" />
        </span>
        <span className="grid min-w-0 flex-1 gap-0.5">
          <span className="flex items-center gap-1.5 font-heading text-base font-semibold">
            <PlaneTakeoff className="size-4 shrink-0 text-muted-foreground" />
            <span className="truncate">{originName ?? origin}</span>
            <ArrowRight className="size-4 shrink-0 text-muted-foreground" />
            <span className="truncate">{mode === "everywhere" ? t.summary.anywhere : country}</span>
          </span>
          <span className="truncate text-sm text-muted-foreground">{detail}</span>
        </span>
        <span className="flex h-9 shrink-0 items-center gap-1.5 rounded-lg border px-3 text-sm font-medium transition-colors group-hover:bg-muted">
          <Pencil className="size-3.5" />
          <span className="sr-only sm:not-sr-only">{t.summary.edit}</span>
        </span>
      </button>
      <button
        type="button"
        onClick={share}
        className="flex h-9 shrink-0 items-center gap-1.5 rounded-lg border px-3 text-sm font-medium transition-colors outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        {copied ? <Check className="size-3.5 text-save" /> : <Share2 className="size-3.5" />}
        <span className="sr-only sm:not-sr-only">{copied ? t.summary.copied : t.summary.share}</span>
      </button>
      <span className="sr-only" aria-live="polite">
        {copied ? t.summary.copied : ""}
      </span>
    </div>
  );
}
