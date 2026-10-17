// Finds where a place really is with OpenStreetMap's data (free). The AI's own coordinates are often a few
// kilometres off, so every place on the map is located here instead.
// Photon first; when it is down, Nominatim (OpenStreetMap's own search, the same data), at most one request a
// second as its rules ask: an itinerary takes a little longer, but its places are still checked.
import { USER_AGENT as UA } from "@/constants/site";

const PHOTON = "https://photon.komoot.io/api/";
const NOMINATIM = "https://nominatim.openstreetmap.org/search";
const WEEK = 7 * 86400;
// How long to wait for an answer
const TIMEOUT_MS = 8000;
// After Photon fails, Nominatim straight away for this long (not a failed try for every place)
const PHOTON_PAUSE_MS = 10 * 60_000;
// Nominatim's rule: one request a second at most (a little more, to be safe)
const NOMINATIM_GAP_MS = 1100;
// Nominatim prefers results inside this box around `near` (degrees each way)
const NEAR_BOX = 0.5;

let photonDownUntil = 0;
let nextNominatimSlot = 0;

// Waits for this server's next free second for Nominatim
const nominatimTurn = async () => {
  const now = Date.now();
  const slot = Math.max(now, nextNominatimSlot);
  nextNominatimSlot = slot + NOMINATIM_GAP_MS;
  if (slot > now) await new Promise((resolve) => setTimeout(resolve, slot - now));
};

const get = async (url) => {
  const response = await fetch(url, { headers: { "user-agent": UA }, next: { revalidate: WEEK }, signal: AbortSignal.timeout(TIMEOUT_MS) });
  if (!response.ok) throw new Error(`responded with ${response.status}`);
  return response.json();
};

// The best match from Photon, null if none; throws when Photon does not answer
const photon = async (query, near) => {
  const params = new URLSearchParams({ q: query, limit: "1" });
  if (near) {
    params.set("lat", String(near.lat));
    params.set("lon", String(near.lng));
  }
  const feature = (await get(`${PHOTON}?${params}`)).features?.[0];
  if (!feature) return null;
  const [lng, lat] = feature.geometry.coordinates;
  const { name, osm_key: key, osm_value: value } = feature.properties ?? {};
  return { lat, lng, name, kind: `${key}:${value}` };
};

// The same from Nominatim (its category and type are OpenStreetMap's key and value, as Photon's)
const nominatim = async (query, near) => {
  const params = new URLSearchParams({ q: query, format: "jsonv2", limit: "1" });
  if (near) params.set("viewbox", [near.lng - NEAR_BOX, near.lat + NEAR_BOX, near.lng + NEAR_BOX, near.lat - NEAR_BOX].join(","));
  await nominatimTurn();
  const [result] = await get(`${NOMINATIM}?${params}`);
  if (!result) return null;
  return { lat: Number(result.lat), lng: Number(result.lon), name: result.name || result.display_name?.split(",")[0], kind: `${result.category}:${result.type}` };
};

// { lat, lng, name, kind } of the best match for `query` (kind: the OpenStreetMap tag, "amenity:restaurant"),
// preferring results near `near` ({ lat, lng }); null if none, or if neither search answers
export const locate = async (query, near) => {
  if (Date.now() >= photonDownUntil) {
    try {
      return await photon(query, near);
    } catch (error) {
      photonDownUntil = Date.now() + PHOTON_PAUSE_MS;
      console.warn(`Photon failed (${error.message}): Nominatim for the next minutes`);
    }
  }
  try {
    return await nominatim(query, near);
  } catch (error) {
    console.error("Nominatim error", error.message);
    return null;
  }
};
