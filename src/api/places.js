// Towns and cities for a trip planned by hand (through our API, which asks Open-Meteo)
import { api } from "@/api/client";

// [{ id, name, region, country, countryCode, lat, lng, code }] matching `query`, names in `lang`
export const searchPlaces = (query, lang, options) =>
  api.get("/places", { params: { q: query, lang }, ...options }).then((response) => response.data.places);
