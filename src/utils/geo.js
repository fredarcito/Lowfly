const EARTH_RADIUS_KM = 6371;
const radians = (degrees) => (degrees * Math.PI) / 180;

// Great-circle distance in km between two points ({ lat, lon }), or null without coordinates
export const distanceKm = (first, second) => {
  if (first?.lat == null || first?.lon == null || second?.lat == null || second?.lon == null) return null;
  const latitudeDelta = radians(second.lat - first.lat);
  const longitudeDelta = radians(second.lon - first.lon);
  const along =
    Math.sin(latitudeDelta / 2) ** 2 + Math.cos(radians(first.lat)) * Math.cos(radians(second.lat)) * Math.sin(longitudeDelta / 2) ** 2;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(along));
};
