import { handle, iata, day, country, lang } from "@/lib/api";
import { badRequest } from "@/lib/errors";
import { flexible } from "@/lib/flights";

export const maxDuration = 30;

export const GET = handle((p) => {
  const ida = day(p.get("ida"));
  const vuelta = day(p.get("vuelta"));
  if (vuelta <= ida) throw badRequest("returnBeforeOut");
  const flex = Math.min(3, Math.max(1, Number(p.get("flex")) || 2));
  return flexible(iata(p.get("origin")), country(p.get("country")), ida, vuelta, flex, lang(p));
});
