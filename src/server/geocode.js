// Finds where a place really is with OpenStreetMap's data (free). The AI's own coordinates are often a few
// kilometres off, so every place on the map is located here instead.
// Photon first; when it is down, Nominatim (OpenStreetMap's own search, the same data), at most one request a
// second as its rules ask: an itinerary takes a little longer, but its places are still checked.
// Every answer is kept in place_lookups (supabase/migrations): a search is made once for good (the same cathedral
// in every Palma itinerary), so itineraries are faster, ask the services less and keep their places when they are down.
import { supabaseAdmin } from "@/supabase/admin";
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
// A search that found nothing is made again after this long (the place may be on the map by then)
const NOT_FOUND_MS = 30 * 86_400_000;

let photonDownUntil = 0;
let nextNominatimSlot = 0;
let database = null;

// A search's key in place_lookups: the query in lowercase, and `near` rounded to about 10 km (the AI's positions
// for one place differ a little between itineraries)
const keyOf = (query, near) => ({ query: query.trim().toLowerCase(), near: near ? `${near.lat.toFixed(1)},${near.lng.toFixed(1)}` : "" });

// What a search found before: the place, null (nothing, recently), or undefined (never asked, or unknown: the
// database is not set up or does not answer, and the search is made)
const stored = async (key) => {
  if (!process.env.SUPABASE_SECRET_KEY) return undefined;
  database ??= supabaseAdmin();
  const { data, error } = await database.from("place_lookups").select("result, created_at").match(key).maybeSingle();
  if (error || !data) return undefined;
  if (!data.result && Date.now() - Date.parse(data.created_at) > NOT_FOUND_MS) return undefined;
  return data.result;
};

// Keeps what a search found (a failure is only logged: the place was found anyway)
const store = async (key, result, source) => {
  if (!process.env.SUPABASE_SECRET_KEY) return;
  database ??= supabaseAdmin();
  const { error } = await database.from("place_lookups").upsert({ ...key, result, source, created_at: new Date().toISOString() });
  if (error) console.error("Could not keep the place", error.message);
};

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

// The search made now: { result, source }; throws when neither service answers
const search = async (query, near) => {
  if (Date.now() >= photonDownUntil) {
    try {
      return { result: await photon(query, near), source: "photon" };
    } catch (error) {
      photonDownUntil = Date.now() + PHOTON_PAUSE_MS;
      console.warn(`Photon failed (${error.message}): Nominatim for the next minutes`);
    }
  }
  return { result: await nominatim(query, near), source: "nominatim" };
};

// { lat, lng, name, kind } of the best match for `query` (kind: the OpenStreetMap tag, "amenity:restaurant"),
// preferring results near `near` ({ lat, lng }); null if none, or if no search answers (not kept then).
// "Nothing found" is only kept when Photon said it: Nominatim is stricter with names (it misses "Catedral-Basílica de
// Santa María de Mallorca"), and Photon is asked again once it is back.
export const locate = async (query, near) => {
  const key = keyOf(query, near);
  const known = await stored(key).catch(() => undefined);
  if (known !== undefined) return known;
  try {
    const { result, source } = await search(query, near);
    if (result || source === "photon") await store(key, result, source).catch((error) => console.error("Could not keep the place", error.message));
    return result;
  } catch (error) {
    console.error("Map search error", error.message);
    return null;
  }
};
