import { handle, iata, day, range, stay, maxPrice, lang } from "@/server/handler";
import { everywhere } from "@/server/flights";

export const maxDuration = 30;

export const GET = handle((p) => {
  const from = day(p.get("from"));
  const to = day(p.get("to"));
  range(from, to, 180);
  return everywhere(iata(p.get("origin")), from, to, maxPrice(p.get("max")), stay(p, from, to), lang(p));
});
