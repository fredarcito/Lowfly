// Finds where a place really is with Photon (OpenStreetMap data, free). The AI's own coordinates are
// often a few kilometres off, so every place on the map is located here instead.
const UA = "Lowfly (https://lowfly-one.vercel.app)";
const WEEK = 7 * 86400;

// { lat, lng, name, kind } of the best match for `query` (kind: the OpenStreetMap tag, "amenity:restaurant"), preferring results near `near` ({ lat, lng }); null if none
export async function locate(query, near) {
  const params = new URLSearchParams({ q: query, limit: "1" });
  if (near) {
    params.set("lat", String(near.lat));
    params.set("lon", String(near.lng));
  }
  try {
    const response = await fetch(`https://photon.komoot.io/api/?${params}`, {
      headers: { "user-agent": UA },
      next: { revalidate: WEEK },
    });
    if (!response.ok) return null;
    const feature = (await response.json()).features?.[0];
    if (!feature) return null;
    const [lng, lat] = feature.geometry.coordinates;
    const { name, osm_key: key, osm_value: value } = feature.properties ?? {};
    return { lat, lng, name, kind: `${key}:${value}` };
  } catch (error) {
    console.error("Photon error", error);
    return null;
  }
}
