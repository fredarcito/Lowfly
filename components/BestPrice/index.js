"use client";

import { useEffect, useState } from "react";
import { ExternalLink, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import FareLegs from "@/components/FareLegs";
import { useI18n } from "@/components/I18nProvider";

// Counts up to `value` when it appears (skipped with reduced motion)
function useCountUp(value, ms = 700) {
  const [shown, setShown] = useState(value * 0.4);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return setShown(value);
    let frame;
    const start = performance.now();
    const tick = (now) => {
      const p = Math.min(1, (now - start) / ms);
      setShown(value * (0.4 + 0.6 * (1 - (1 - p) ** 3)));
      if (p < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value, ms]);
  return shown;
}

// The highlighted price at the top. `links` are the booking buttons ({ label, href }).
// With `fare` and `origin` it shows each flight's details below (times, airline, price).
export default function BestPrice({ price, cur, title, detail, links = [], priceNote, fare, origin, label }) {
  const { t, f } = useI18n();
  const shownPrice = useCountUp(price);
  return (
    <Card className="gap-0 p-0 ring-2 ring-primary/40">
      <div className="flex flex-col gap-5 p-5 sm:flex-row sm:items-end sm:justify-between sm:p-6">
        <div className="grid gap-2">
          <Badge className="gap-1">
            <Sparkles />
            {label ?? t.results.cheapest}
          </Badge>
          <p className="font-heading text-5xl leading-none font-extrabold tracking-tight text-primary tabular-nums sm:text-6xl">
            <span aria-hidden="true">{f.money(shownPrice, cur)}</span>
            <span className="sr-only">{f.money(price, cur)}</span>
            {priceNote && <span className="ml-2 font-sans text-base font-normal tracking-normal text-muted-foreground">{priceNote}</span>}
          </p>
          <p className="max-w-[40ch] font-heading text-xl leading-snug font-semibold text-balance">{title}</p>
          {detail && <p className="text-sm text-muted-foreground">{detail}</p>}
        </div>
        {links.length > 0 && (
          <div className="flex flex-col gap-2 sm:items-end">
            {links.map((l) => (
              <Button key={l.href} asChild size="lg" className="h-11 px-5 text-base font-bold">
                <a href={l.href} target="_blank" rel="noopener noreferrer">
                  {l.label}
                  <ExternalLink />
                </a>
              </Button>
            ))}
          </div>
        )}
      </div>
      {fare && (
        <div className="px-5 pb-5 sm:px-6 sm:pb-6">
          <FareLegs fare={fare} origin={origin} />
        </div>
      )}
    </Card>
  );
}
