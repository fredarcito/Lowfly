import { handle, iata, day, range, stay, country as countryParam, city, lang } from "@/server/handler";
import { stopoversTo } from "@/server/stopovers";

export const maxDuration = 30;

// GET /api/stopovers → trips through a hub to a country or city (server/stopovers), with the country search's
// parameters; from flexible dates also `outTo` (leave no later) and `backFrom` (fly home no earlier)
export const GET = handle((params) => {
  const from = day(params.get("from"));
  const to = day(params.get("to"));
  range(from, to, 120);
  return stopoversTo({
    origin: iata(params.get("origin")),
    country: countryParam(params.get("country")),
    city: city(params.get("city")),
    from,
    to,
    stay: stay(params, from, to),
    outTo: params.get("outTo") ? day(params.get("outTo")) : null,
    backFrom: params.get("backFrom") ? day(params.get("backFrom")) : null,
    lang: lang(params),
  });
});
