import { handleSearch, iata, day, country, city, lang } from "@/server/handler";
import { badRequest } from "@/server/errors";
import { flexible } from "@/server/flights";

export const maxDuration = 30;

export const GET = handleSearch((params) => {
  const ida = day(params.get("ida"));
  const vuelta = day(params.get("vuelta"));
  if (vuelta <= ida) throw badRequest("returnBeforeOut");
  const flex = Math.min(3, Math.max(1, Number(params.get("flex")) || 2));
  return flexible(iata(params.get("origin")), country(params.get("country")), city(params.get("city")), ida, vuelta, flex, lang(params));
});
