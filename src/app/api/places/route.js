import { handle, lang } from "@/server/handler";
import { badRequest } from "@/server/errors";
import { searchPlaces } from "@/server/places";

// GET /api/places?q=flor&lang=es → { places: [...] } (towns and cities for a trip planned by hand)
export const GET = handle(async (params) => {
  const query = (params.get("q") ?? "").trim().slice(0, 80);
  if (query.length < 2) throw badRequest("placeTooShort");
  return { places: await searchPlaces(query, lang(params)) };
});
