import { handle, iata, day, range, lang } from "@/server/handler";
import { badRequest } from "@/server/errors";
import { multiCityTrips } from "@/server/multiCity";
import { MAX_WINDOW_NIGHTS, MIN_WINDOW_NIGHTS } from "@/server/multiCity/fit";
import { nightsBetween } from "@/utils/dates";

export const maxDuration = 30;

// GET /api/multi-city?origin=MLA&from=2026-11-12&to=2026-11-19 → trips through several cities for the dates someone is
// free (server/multiCity, docs/multi-city.md): 5 to 15 days
export const GET = handle((params) => {
  const from = day(params.get("from"));
  const to = day(params.get("to"));
  range(from, to, MAX_WINDOW_NIGHTS);
  if (nightsBetween(from, to) < MIN_WINDOW_NIGHTS) throw badRequest("multiCityTooShort", { min: MIN_WINDOW_NIGHTS + 1 });
  return multiCityTrips({ origin: iata(params.get("origin")), from, to, lang: lang(params) });
});
