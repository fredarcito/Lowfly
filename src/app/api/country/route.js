import { handle, iata, day, range, stay, country as countryParam, city, maxPrice, lang } from "@/server/handler";
import { country } from "@/server/flights";

export const maxDuration = 30;

export const GET = handle((params) => {
  const from = day(params.get("from"));
  const to = day(params.get("to"));
  range(from, to, 120); // a country with many airports means many requests
  return country(iata(params.get("origin")), countryParam(params.get("country")), city(params.get("city")), from, to, maxPrice(params.get("max")), stay(params, from, to), lang(params));
});
