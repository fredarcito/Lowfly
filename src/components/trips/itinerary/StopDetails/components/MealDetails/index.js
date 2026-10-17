"use client";

import { ArrowUpRight, Footprints, HandCoins, MapPin, Utensils } from "lucide-react";
import { useI18n } from "@/context/i18n";
import { searchUrl } from "@/utils/itinerary";
import MealSection from "@/components/trips/itinerary/StopDetails/components/MealDetails/components/MealSection";
import StopDishes from "@/components/trips/itinerary/StopDetails/components/MealDetails/components/StopDishes";

const FOOT = "flex items-start gap-2 text-sm text-muted-foreground";

// An opened meal, in one panel: where to look (with a Google Maps search when it has no set place, in `town`), what
// to order, and last a note where a tip is expected and the walk on. No price: the AI's guesses were often far off,
// and a wrong one could put people off a good place. Its practical note stays above, by its title.
const MealDetails = ({ stop, town }) => {
  const { texts } = useI18n();
  const mapLink = !stop.place && stop.food ? searchUrl([stop.food, town].filter(Boolean).join(", ")) : null;
  return (
    <div className="grid divide-y divide-foreground/10 rounded-lg bg-foreground/[0.03] ring-1 ring-foreground/10">
      {stop.food && (
        <MealSection icon={MapPin} title={texts.trips.whereToLook}>
          <p className="text-sm text-muted-foreground">{stop.food}</p>
          {mapLink && (
            <a
              href={mapLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-fit items-center gap-1.5 text-sm font-semibold text-primary-ink hover:underline"
            >
              {texts.trips.seeOnMap} <ArrowUpRight className="size-4" />
            </a>
          )}
        </MealSection>
      )}
      {stop.dishes?.length > 0 && (
        <MealSection icon={Utensils} title={texts.trips.whatToOrder}>
          <StopDishes dishes={stop.dishes} />
        </MealSection>
      )}
      {(stop.tip || stop.walkToNext) && (
        <div className="grid gap-2 px-3 py-3 sm:px-4">
          {stop.tip && (
            <p className={FOOT}>
              <HandCoins className="mt-0.5 size-4 shrink-0" /> {texts.trips.tip(stop.tip.min, stop.tip.max)}
            </p>
          )}
          {stop.walkToNext && (
            <p className={FOOT} title={texts.trips.walkHint}>
              <Footprints className="mt-0.5 size-4 shrink-0" /> {texts.trips.walk(stop.walkToNext)}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default MealDetails;
