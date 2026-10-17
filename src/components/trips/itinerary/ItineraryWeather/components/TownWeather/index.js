import { Backpack, Shirt } from "lucide-react";
import PackItem from "@/components/trips/itinerary/ItineraryWeather/components/PackItem";
import { useI18n } from "@/context/i18n";
import { degrees } from "@/components/trips/itinerary/ItineraryWeather/data/degrees";
import { weatherIcon } from "@/components/trips/itinerary/ItineraryWeather/data/icons";

// One town's weather in detail, under "What to pack": what it is usually like, then what to wear and what else to
// bring (side by side on wider screens). `showCity` (a route of several towns): its name, how it feels, its
// temperatures and the rain first.
const TownWeather = ({ weather, showCity }) => {
  const { texts } = useI18n();
  const words = texts.trips.weather;
  const Icon = weatherIcon(weather);
  return (
    <li className="grid min-w-0 gap-3 text-sm">
      {showCity && (
        <p className="flex items-center gap-2 font-semibold">
          <Icon aria-hidden className="size-4 shrink-0 text-muted-foreground" />
          {weather.city} · {words.feels[weather.feels]} · {words.range(degrees(weather.low), degrees(weather.high))} · {words.rain[weather.rain]}
        </p>
      )}
      {weather.summary && <p className="text-muted-foreground">{weather.summary}</p>}
      <div className="grid gap-3 sm:grid-cols-2 sm:gap-0 sm:divide-x">
        {weather.clothes && <PackItem icon={Shirt} label={words.clothes} text={weather.clothes} className="sm:pr-6" />}
        {weather.essentials && <PackItem icon={Backpack} label={words.essentials} text={weather.essentials} className="sm:pl-6" />}
      </div>
    </li>
  );
};

export default TownWeather;
