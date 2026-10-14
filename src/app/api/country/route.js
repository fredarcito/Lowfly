import { handle, iata, day, range, stay, country as countryParam, city, maxPrice, lang } from "@/server/handler";
import { country } from "@/server/flights";

export const maxDuration = 30;

export const GET = handle((p) => {
  const from = day(p.get("from"));
  const to = day(p.get("to"));
  range(from, to, 120); // a country with many airports means many requests
  return country(iata(p.get("origin")), countryParam(p.get("country")), city(p.get("city")), from, to, maxPrice(p.get("max")), stay(p, from, to), lang(p));
});
