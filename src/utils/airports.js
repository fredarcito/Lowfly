import { normalize } from "@/utils/format";

// How well an airport matches the searched text: its code, then names that start with it, then its country
const rankOf = (airport, searched) => {
  if (airport.code.toLowerCase() === searched) return 0;
  if (normalize(airport.city).startsWith(searched) || normalize(airport.name).startsWith(searched)) return 1;
  if (normalize(airport.country).startsWith(searched)) return 2;
  return 3;
};

// The departure airports to show for what was typed: with nothing, every airport by country and name; with a
// query, the matches, best first
export const searchAirports = (airports, query, lang) => {
  const searched = normalize(query.trim());
  const sorted = [...airports].sort(
    (first, second) => first.country.localeCompare(second.country, lang) || first.name.localeCompare(second.name, lang)
  );
  if (!searched) return sorted;
  return sorted
    .filter((airport) => normalize(`${airport.code} ${airport.name} ${airport.city} ${airport.country}`).includes(searched))
    .sort((first, second) => rankOf(first, searched) - rankOf(second, searched));
};

// Consecutive airports of the same country, each with its index in the list: [{ country, countryCode, items }]
export const groupByCountry = (airports) => {
  const groups = [];
  airports.forEach((airport, index) => {
    const last = groups.at(-1);
    if (last?.country === airport.country) last.items.push({ airport, index });
    else groups.push({ country: airport.country, countryCode: airport.countryCode, items: [{ airport, index }] });
  });
  return groups;
};
