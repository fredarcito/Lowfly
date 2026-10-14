// Towns and cities for a trip planned by hand, from the Open-Meteo geocoding API (GeoNames data, free, no key):
// it knows the names in the visitor's language ("Florencia" → Firenze) and puts the big cities first.
// Only called from the server.
import { getAirports } from "@/server/airports";
import { km } from "@/utils/itinerary";

const ENDPOINT = "https://geocoding-api.open-meteo.com/v1/search";
const DAY = 86400;
// An airport this close stands for the town (its photo and its "why go")
const NEAREST_AIRPORT_KM = 30;
const RESULTS = 6;

// [{ id, name, region, country, countryCode, lat, lng, code }] for what the visitor typed (code: the nearest
// airport we know, or null)
export const searchPlaces = async (query, lang = "es") => {
  const params = new URLSearchParams({ name: query, count: String(RESULTS), language: lang, format: "json" });
  const response = await fetch(`${ENDPOINT}?${params}`, { next: { revalidate: DAY } });
  if (!response.ok) throw new Error(`Open-Meteo geocoding responded with error ${response.status}`);
  const results = (await response.json()).results ?? [];

  const { airports } = await getAirports(lang).catch(() => ({ airports: [] }));
  const nearestAirport = (point) => {
    let nearest = null;
    for (const airport of airports) {
      if (airport.lat == null) continue;
      const distance = km(point, { lat: airport.lat, lng: airport.lon });
      if (distance <= NEAREST_AIRPORT_KM && (!nearest || distance < nearest.distance)) nearest = { code: airport.code, distance };
    }
    return nearest?.code ?? null;
  };

  return results.map((place) => {
    const point = { lat: place.latitude, lng: place.longitude };
    return {
      id: String(place.id),
      name: place.name,
      region: place.admin1 ?? null,
      country: place.country ?? "",
      countryCode: place.country_code ?? null,
      ...point,
      code: nearestAirport(point),
    };
  });
};
