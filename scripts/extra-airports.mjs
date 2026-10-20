// Writes src/data/extraAirports.json: the airports easyJet and Vueling fly to (constants/airlines GRAPH_MORE_AIRLINES)
// that Ryanair's and Wizz Air's lists may not have (Geneva, Zurich, Florence, Paris-CDG…), with their airport and
// city names in each language, country, place and time zone, from Travelpayouts' public data (no token). The app
// adds them to its airports as destinations only (server/airports): never offered as a departure airport, as no
// live search runs from them. Run it again when those airlines open new airports (rarely); read the diff.
//
//   node scripts/extra-airports.mjs
import fs from "node:fs";
import { GRAPH_MORE_AIRLINES, MORE_AIRLINES } from "../src/constants/airlines.js";

const FILE = new URL("../src/data/extraAirports.json", import.meta.url);
const DATA = "https://api.travelpayouts.com/data";
const LANGS = ["es", "en"];

const json = async (url) => {
  const response = await fetch(url, { headers: { "user-agent": "Lowfly (https://lowfly.travel)" } });
  if (!response.ok) throw new Error(`${url}: ${response.status}`);
  return response.json();
};

// The IATA codes of our graph airlines → their id ("U2" → "easyjet")
const airlineOfCode = Object.fromEntries(GRAPH_MORE_AIRLINES.flatMap((airline) => MORE_AIRLINES[airline].codes.map((code) => [code, airline])));

const [routes, ...named] = await Promise.all([
  json(`${DATA}/routes.json`),
  ...LANGS.flatMap((lang) => [json(`${DATA}/${lang}/airports.json`), json(`${DATA}/${lang}/cities.json`)]),
]);
const byLang = Object.fromEntries(
  LANGS.map((lang, index) => [
    lang,
    { airports: new Map(named[index * 2].map((airport) => [airport.code, airport])), cities: new Map(named[index * 2 + 1].map((city) => [city.code, city])) },
  ])
);

// Every airport of their direct routes (their own flights, not another airline's codeshare), with the airlines there
const airlinesAt = new Map();
for (const route of routes) {
  const airline = airlineOfCode[route.airline_iata];
  if (!airline || route.codeshare || route.transfers) continue;
  for (const code of [route.departure_airport_iata, route.arrival_airport_iata]) airlinesAt.set(code, new Set([...(airlinesAt.get(code) ?? []), airline]));
}

const extra = {};
const missing = [];
for (const [code, airlines] of [...airlinesAt].sort(([first], [second]) => first.localeCompare(second))) {
  const english = byLang.en.airports.get(code);
  if (!english || english.iata_type !== "airport" || !english.coordinates || !english.time_zone) {
    missing.push(code);
    continue;
  }
  const nameIn = (lang) => byLang[lang].airports.get(code)?.name || english.name;
  const cityIn = (lang) => byLang[lang].cities.get(english.city_code)?.name || byLang.en.cities.get(english.city_code)?.name || english.name;
  extra[code] = {
    name: Object.fromEntries(LANGS.map((lang) => [lang, nameIn(lang)])),
    city: Object.fromEntries(LANGS.map((lang) => [lang, cityIn(lang)])),
    countryCode: english.country_code,
    lat: Math.round(english.coordinates.lat * 10_000) / 10_000,
    lon: Math.round(english.coordinates.lon * 10_000) / 10_000,
    tz: english.time_zone,
    airlines: [...airlines].sort(),
  };
}

fs.writeFileSync(FILE, `${JSON.stringify(extra, null, 1)}\n`);
console.log(`${Object.keys(extra).length} airports written${missing.length ? `; left out (no place or time zone): ${missing.join(", ")}` : ""}`);
