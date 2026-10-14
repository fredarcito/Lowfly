import { handle, iata, day, country, city, lang } from "@/server/handler";
import { badRequest } from "@/server/errors";
import { flexible } from "@/server/flights";

export const maxDuration = 30;

export const GET = handle((p) => {
  const ida = day(p.get("ida"));
  const vuelta = day(p.get("vuelta"));
  if (vuelta <= ida) throw badRequest("returnBeforeOut");
  const flex = Math.min(3, Math.max(1, Number(p.get("flex")) || 2));
  return flexible(iata(p.get("origin")), country(p.get("country")), city(p.get("city")), ida, vuelta, flex, lang(p));
});
