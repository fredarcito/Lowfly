"use client";

import { ArrowRight, Luggage } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import DealCard from "@/components/search/DealCard";
import WeekendPicker from "@/components/search/WeekendPicker";
import { useI18n } from "@/context/i18n";
import { useWeekendDeals } from "@/components/search/WeekendDeals/hooks/useWeekendDeals";

const SHOWN = 6; // 3 × 2 on desktop, 2 × 3 on tablets, a swipeable row on phones
const WEEKENDS = 4;

// Before searching: the cheapest weekend trips from the departure airport, for each of the next weekends
// (useWeekendDeals), with "see every destination" when there are more. If the airlines fail it shows `fallback`.
const WeekendDeals = ({ origin, originName, onSeeAll, fallback }) => {
  const { lang, texts } = useI18n();
  const deals = useWeekendDeals(origin, lang, WEEKENDS);
  const loading = deals.status === "loading";

  if (deals.status === "error") return fallback;

  return (
    <section className="grid gap-4" aria-busy={loading}>
      <div className="grid gap-1">
        <h2 className="flex items-center gap-2 font-heading text-xl font-bold tracking-tight sm:text-2xl">
          <Luggage className="size-5 text-primary sm:size-6" /> {texts.deals.title}
        </h2>
        <p className="text-sm text-muted-foreground">{texts.deals.subtitle(originName ?? origin)}</p>
      </div>

      <WeekendPicker weekends={deals.weekends} picked={deals.picked} onPick={deals.setPicked} />

      {!loading && deals.results.length === 0 ? (
        <p className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">{texts.results.noFlights}</p>
      ) : (
        <div className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 scrollbar-none sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-4 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-3">
          {loading
            ? Array.from({ length: SHOWN }, (_, slot) => <Skeleton key={slot} className="aspect-[4/3.4] w-[82%] shrink-0 snap-start rounded-xl sm:w-auto" />)
            : deals.results.slice(0, SHOWN).map((fare) => <DealCard key={fare.code} fare={fare} origin={origin} />)}
        </div>
      )}

      {deals.results.length > SHOWN && (
        <Button variant="outline" className="justify-self-start" onClick={() => onSeeAll(deals.weekend)}>
          {texts.deals.seeAll} ({deals.results.length}) <ArrowRight />
        </Button>
      )}
    </section>
  );
};

export default WeekendDeals;
