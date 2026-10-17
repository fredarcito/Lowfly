"use client";

import { useId, useState } from "react";
import { ChevronDown } from "lucide-react";
import Collapse from "@/components/shared/Collapse";
import TownWeather from "@/components/trips/itinerary/ItineraryWeather/components/TownWeather";
import { useWeatherSummary } from "@/components/trips/itinerary/ItineraryWeather/hooks/useWeatherSummary";
import { useI18n } from "@/context/i18n";
import { cn } from "@/utils/cn";

// The weather to expect on the trip, in one line above the days (made with the itinerary, server/itinerary): the
// usual temperatures and rain of the season, so nobody lands somewhere colder than they thought. "What to pack"
// unfolds what it is like and what to bring. Always said to be the usual climate, not a forecast.
// Phones: two lines (the weather, then the season), the note in the unfolded part; wider screens: one line, with
// the note at the end.
const ItineraryWeather = ({ weather, days }) => {
  const { texts } = useI18n();
  const words = texts.trips.weather;
  const { Icon, parts, months } = useWeatherSummary(weather, days);
  const [open, setOpen] = useState(false);
  const detailsId = useId();
  return (
    <section aria-label={words.title} className="grid border-y py-3 sm:rounded-xl sm:border sm:px-5">
      <div className="flex items-center gap-2.5 sm:gap-4">
        <Icon aria-hidden className="size-6 shrink-0 text-muted-foreground sm:size-7" />
        <div className="grid min-w-0 flex-1 gap-0.5">
          {/* The line breaks only between its parts, never inside "12 to 20 °C" or "Some rain" */}
          <p className="text-sm font-semibold sm:text-base">
            <span className="max-sm:hidden">{words.season(months)} · </span>
            {parts.map((part, index) => (
              <span key={part}>
                {index > 0 && " · "}
                <span className="whitespace-nowrap">{part}</span>
              </span>
            ))}
          </p>
          <p className="truncate text-sm text-muted-foreground sm:hidden">{words.season(months)}</p>
        </div>
        <button
          type="button"
          aria-expanded={open}
          aria-controls={detailsId}
          onClick={() => setOpen((wasOpen) => !wasOpen)}
          className="flex shrink-0 items-center gap-1 rounded-md text-sm font-medium outline-none hover:text-primary-ink focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          {words.pack}
          <ChevronDown className={cn("size-4 transition-transform", open && "rotate-180")} />
        </button>
        <p className="shrink-0 border-l pl-4 text-sm text-muted-foreground max-sm:hidden">{words.notForecast}</p>
      </div>
      <Collapse open={open}>
        <div id={detailsId} className="mt-3 grid gap-3 border-t pt-3">
          <ul className="grid gap-4">
            {weather.map((town) => (
              <TownWeather key={town.city} weather={town} showCity={weather.length > 1} />
            ))}
          </ul>
          <p className="text-xs text-muted-foreground">{words.notForecastLong}</p>
        </div>
      </Collapse>
    </section>
  );
};

export default ItineraryWeather;
