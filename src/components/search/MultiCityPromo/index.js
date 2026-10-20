"use client";

import { ArrowRight, Route } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/context/i18n";

// Under the "A cualquier sitio" results, when their dates are enough for a route (5 to 15 days): the same dates in
// the "Recorridos" search, several cities instead of one
const MultiCityPromo = ({ onSearch }) => {
  const { texts } = useI18n();
  const labels = texts.multiCity;
  return (
    <aside className="flex flex-col gap-4 rounded-xl bg-primary/10 px-5 py-5 ring-1 ring-primary/30 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex gap-3">
        <Route className="mt-0.5 size-6 shrink-0 text-primary" />
        <div className="grid gap-1">
          <p className="font-heading text-lg font-semibold">{labels.promoTitle}</p>
          <p className="text-sm text-muted-foreground">{labels.promoText}</p>
        </div>
      </div>
      <Button size="lg" onClick={onSearch} className="h-11 shrink-0 font-bold">
        {labels.promoAction}
        <ArrowRight />
      </Button>
    </aside>
  );
};

export default MultiCityPromo;
