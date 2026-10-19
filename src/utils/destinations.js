import { normalize } from "@/utils/format";

// Destinations grouped by country, then by city (every airport of a city together), sorted by name in `lang`:
// [{ name, countryCode, codes, stopover, cities: [{ name, codes, stopover }] }] (`stopover`: reached with one stop
// only, none of its airports has a direct flight)
export const countriesOf = (destinations, lang) => {
  const byCountry = new Map();
  for (const destination of destinations) {
    const stopover = Boolean(destination.stopover);
    if (!byCountry.has(destination.country))
      byCountry.set(destination.country, { name: destination.country, countryCode: destination.countryCode, codes: [], stopover, cities: new Map() });
    const country = byCountry.get(destination.country);
    country.codes.push(destination.code);
    country.stopover &&= stopover;
    if (!country.cities.has(destination.city)) country.cities.set(destination.city, { name: destination.city, codes: [], stopover });
    const city = country.cities.get(destination.city);
    city.codes.push(destination.code);
    city.stopover &&= stopover;
  }
  const byName = (first, second) => first.name.localeCompare(second.name, lang);
  return [...byCountry.values()]
    .map((country) => ({ ...country, cities: [...country.cities.values()].sort(byName) }))
    .sort(byName);
};

// The destination kept when the list changes (another departure airport): the same country and city if this
// airport flies there, the whole country if only the city is missing, otherwise the first country
export const keptDestination = (countries, { country, city }) => {
  const same = countries.find((candidate) => candidate.name === country);
  if (!same) return { country: countries[0]?.name || "", city: "" };
  return { country, city: same.cities.some((candidate) => candidate.name === city) ? city : "" };
};

// The destination picker's options for what was typed: each country (city null) and its cities. With a query,
// only the matches: a country whose name matches keeps all its cities, otherwise only the cities (or airport
// codes) that match. A country with a single city shows only the country (it already searches that city).
export const destinationOptions = (countries, query) => {
  const searched = normalize(query.trim());
  const options = [];
  for (const country of countries) {
    const countryMatches = !searched || normalize(country.name).includes(searched);
    const cities = countryMatches
      ? country.cities
      : country.cities.filter((city) => normalize(city.name).includes(searched) || city.codes.some((code) => code.toLowerCase() === searched));
    if (!countryMatches && !cities.length) continue;
    options.push({ country, city: null });
    if (country.cities.length > 1) cities.forEach((city) => options.push({ country, city }));
  }
  return options;
};

// An option's key: "Italia|Roma", or "Italia|" for the whole country
export const destinationKey = ({ country, city }) => `${country.name ?? country}|${city?.name ?? city ?? ""}`;

// Is the chosen destination ({ country, city }, city "" = the whole country) reached with a stop only?
export const isStopoverOnly = (countries, { country, city }) => {
  const chosen = countries.find((candidate) => candidate.name === country);
  if (!chosen) return false;
  return city ? Boolean(chosen.cities.find((candidate) => candidate.name === city)?.stopover) : chosen.stopover;
};
