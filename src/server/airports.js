// Every airport you can fly from with Ryanair or Wizz Air, plus the ones only easyJet and Vueling fly to
// (src/data/extraAirports.json, scripts/extra-airports.mjs: Geneva, Zurich, Florence…) as destinations only
// (`destinationOnly`: never a departure airport, no live search runs from them). Only called from the server.
import * as ryanair from "@/server/ryanair";
import * as wizz from "@/server/wizz";
import { countryName } from "@/server/countries";
import extraAirports from "@/data/extraAirports.json";
import { DEFAULT_ORIGIN } from "@/constants/airports";

// The extra airports missing from Ryanair's and Wizz Air's lists, as theirs are, in `lang`
const extraOf = (known, lang) =>
  Object.entries(extraAirports)
    .filter(([code]) => !known.has(code))
    .map(([code, airport]) => ({
      code,
      name: airport.name[lang] ?? airport.name.en,
      city: airport.city[lang] ?? airport.city.en,
      country: countryName(airport.countryCode, airport.countryCode, lang),
      countryCode: airport.countryCode,
      main: false,
      tz: airport.tz,
      lat: airport.lat,
      lon: airport.lon,
      airlines: airport.airlines,
      destinationOnly: true,
    }));

export const getAirports = async (lang = "es") => {
  const [ry, wz] = await Promise.allSettled([ryanair.airports(lang), wizz.airports(lang)]);
  const byCode = new Map();
  // Ryanair first: its data is richer (time zone, the country's main airport)
  for (const { airline, ...airport } of [...(ry.value || []), ...(wz.value || [])]) {
    const known = byCode.get(airport.code);
    if (known) known.airlines.push(airline);
    else byCode.set(airport.code, { ...airport, airlines: [airline] });
  }
  if (!byCode.size) throw new Error("No airline returned its airports");
  return { airports: withCities([...byCode.values(), ...extraOf(byCode, lang)]) };
};

// Wizz names its cities after the airport ("Roma Fiumicino", "Londres Gatwick", "París-Orly", "Salerno (Nápoles)"),
// Ryanair after the city ("Roma"). A name that starts with another city of the same country becomes that city,
// so every airport of a city can be searched together.
const withCities = (airports) => {
  const citiesByCountry = new Map();
  for (const airport of airports) {
    airport.city = airport.city.replace(/\s*\(.*\)$/, "").trim();
    if (!citiesByCountry.has(airport.countryCode)) citiesByCountry.set(airport.countryCode, new Set());
    citiesByCountry.get(airport.countryCode).add(airport.city);
  }
  for (const airport of airports) {
    const cities = [...citiesByCountry.get(airport.countryCode)];
    const city = cities
      .filter((other) => airport.city.startsWith(other) && /[\s-]/.test(airport.city.charAt(other.length)))
      .sort((first, second) => first.length - second.length)[0];
    if (city) airport.city = city;
  }
  return airports;
};

// Departure airport for a first visit: the main airport of the visitor's country if we fly from it,
// otherwise Malta. The country comes from Vercel (IP geolocation); without it (local development)
// from the browser's time zone.
export const defaultOrigin = async (country, tz) => {
  const { airports } = await getAirports("en");
  const code = (country || airports.find((airport) => tz && airport.tz === tz)?.countryCode || "").toUpperCase();
  const here = airports.filter((airport) => airport.countryCode === code && !airport.destinationOnly);
  return { country: code || null, origin: (here.find((airport) => airport.main) || here[0])?.code ?? DEFAULT_ORIGIN };
};
