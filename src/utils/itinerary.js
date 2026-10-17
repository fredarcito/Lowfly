// Itineraries: day-by-day stops for a saved trip, and their Google Maps links.
// Shape (made by the AI, server/itinerary): { source, lang, createdAt, preferences,
//   weather?: [{ city, feels, low, high, rain, summary, clothes, essentials }] (each town's usual weather on those dates; older
//   itineraries have none), days: [{ date, city?, title, mode, stops: [{ time, type, title, note?, why?, lookFor?,
//   food?, cost?, place?: { name, lat, lng }, history?, sources? }] }] }

// A Google Maps route takes an origin, a destination and up to 9 stops in between (in the app)
const MAX_ROUTE_POINTS = 11;
// Farther than this from the next stop, a first or last stop is out of town (the airport)
const OUT_OF_TOWN_KM = 8;
// Walking estimate without a routing service: streets are about 30% longer than the straight line, at 4.8 km/h
const STREET_FACTOR = 1.3;
const WALKING_KMH = 4.8;

// Distance in km between two places (haversine)
export const km = (from, to) => {
  const radians = Math.PI / 180;
  const haversine =
    Math.sin(((to.lat - from.lat) * radians) / 2) ** 2 +
    Math.cos(from.lat * radians) * Math.cos(to.lat * radians) * Math.sin(((to.lng - from.lng) * radians) / 2) ** 2;
  return 12742 * Math.asin(Math.sqrt(haversine));
};

// The places of a day without an out-of-town first or last stop (arriving from or leaving for the
// airport by train or taxi): the part you walk, and what the map frames.
const inTown = (places) => {
  let list = places;
  while (list.length > 2 && km(list[0], list[1]) > OUT_OF_TOWN_KM) list = list.slice(1);
  while (list.length > 2 && km(list.at(-1), list.at(-2)) > OUT_OF_TOWN_KM) list = list.slice(0, -1);
  return list;
};

// Approximate minutes on foot between two places (rounded to 5), or null if they are too far apart to walk
const walkingMinutes = (from, to) => {
  const distance = km(from, to);
  if (distance > OUT_OF_TOWN_KM) return null;
  return Math.max(5, Math.round(((distance * STREET_FACTOR) / WALKING_KMH) * 12) * 5);
};

// Part of the day a stop starts in, from its time ("07:45–08:17" → morning)
const PERIOD_STARTS = [
  ["night", 19],
  ["afternoon", 12],
  ["morning", 0],
];

const periodOf = (time) => {
  const hour = Number(time?.match(/^(\d{1,2}):/)?.[1]);
  if (Number.isNaN(hour)) return null;
  return PERIOD_STARTS.find(([, start]) => hour >= start)[0];
};

// A day ready to show:
// - every stop gets a stable `id` (to mark it visited) and its `period` (morning, afternoon, night)
// - places in town are numbered as on the map; on walking days the airport ends are left off the map
//   (`outOfTown`), since the day is about the town
// - numbered stops on walking days carry the estimated walk to the next one
export const dayPlan = (day) => {
  // A day trip is not a walk around town: its places far from the centre stay in
  const walking = (day.mode === "walking" || !day.mode) && !day.excursion;
  const places = day.stops.filter((stop) => stop.place).map((stop) => stop.place);
  const onMap = new Set(walking ? inTown(places) : places);
  let placeCount = 0;
  const stops = day.stops.map((stop, index) => {
    const mapped = Boolean(stop.place && onMap.has(stop.place));
    return {
      ...stop,
      id: stop.id ?? `${day.date}-${index}`,
      period: periodOf(stop.time),
      number: mapped ? ++placeCount : null,
      outOfTown: Boolean(stop.place && !mapped),
    };
  });
  const numbered = stops.filter((stop) => stop.number);
  numbered.forEach((stop, index) => {
    const next = numbered[index + 1];
    if (walking && next) stop.walkToNext = walkingMinutes(stop.place, next.place);
  });
  const mapStops = numbered.map((stop) => ({ number: stop.number, name: stop.place.name, lat: stop.place.lat, lng: stop.place.lng }));
  return { stops, mapStops, routes: routeUrls(day) };
};

// Directions to a stop from wherever you are, in Google Maps (the app on phones)
export const directionsUrl = (place, mode = "walking") => {
  const url = `https://www.google.com/maps/dir/?api=1&destination=${place.lat},${place.lng}&travelmode=${mode}`;
  return place.placeId ? `${url}&destination_place_id=${place.placeId}` : url;
};

// The day's route in Google Maps, stops in the order of the plan. Longer days are split into legs
// (each leg starts where the previous one ended).
// On foot, the airport legs are left out (inTown).
const routeUrls = (day) => {
  const places = day.stops.filter((stop) => stop.place).map((stop) => stop.place);
  // A day trip is not a walk around town: its places far from the centre stay in
  const walking = (day.mode === "walking" || !day.mode) && !day.excursion;
  const points = (walking ? inTown(places) : places).map((place) => `${place.lat},${place.lng}`);
  // The same place twice in a row adds nothing to the route
  const path = points.filter((point, index) => point !== points[index - 1]);
  if (path.length < 2) return [];
  const legs = [];
  for (let start = 0; start < path.length - 1; start += MAX_ROUTE_POINTS - 1) legs.push(path.slice(start, start + MAX_ROUTE_POINTS));
  return legs.map((leg) => {
    const url = `https://www.google.com/maps/dir/?api=1&origin=${leg[0]}&destination=${leg.at(-1)}&travelmode=${day.mode || "walking"}`;
    const waypoints = leg.slice(1, -1).join("|");
    return waypoints ? `${url}&waypoints=${encodeURIComponent(waypoints)}` : url;
  });
};
