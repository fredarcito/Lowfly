"use client";

import { useI18n } from "@/context/i18n";
import { LOCALE_TAGS } from "@/i18n/config";
import { degrees } from "@/components/trips/itinerary/ItineraryWeather/data/degrees";
import { WEATHER_ICONS, weatherKey } from "@/components/trips/itinerary/ItineraryWeather/data/icons";

// The trip's weather in one line: { Icon, parts (["12 to 20 °C", "Some rain"], or each town's temperatures on a
// route; shown joined by " · ", each never split),
// months ("November", or "October and November" when the trip crosses into the next month) }.
// `weather`: the itinerary's, one per town; `days`: its days (their dates give the months).
export const useWeatherSummary = (weather, days) => {
  const { lang, texts } = useI18n();
  const words = texts.trips.weather;
  const monthOf = (date) => new Intl.DateTimeFormat(LOCALE_TAGS[lang], { month: "long" }).format(new Date(`${date}T12:00:00`));
  const [firstMonth, lastMonth] = [monthOf(days[0].date), monthOf(days.at(-1).date)];
  const months = firstMonth === lastMonth ? firstMonth : words.twoMonths(firstMonth, lastMonth);
  const range = (town) => words.range(degrees(town.low), degrees(town.high));
  const [first] = weather;
  const parts = weather.length === 1 ? [range(first), words.rain[first.rain]] : weather.map((town) => `${town.city} ${range(town)}`);
  return { Icon: WEATHER_ICONS[weatherKey(first)], parts, months };
};
