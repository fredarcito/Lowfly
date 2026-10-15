import { handle, iata, day, range, stay, maxPrice, lang } from "@/server/handler";
import { everywhere } from "@/server/flights";

export const maxDuration = 30;

export const GET = handle((params) => {
  const from = day(params.get("from"));
  const to = day(params.get("to"));
  range(from, to, 180);
  return everywhere(iata(params.get("origin")), from, to, maxPrice(params.get("max")), stay(params, from, to), lang(params));
});
