// Itineraries: day-by-day stops for a saved trip, and their Google Maps links.
// Shape (the AI will return the same): { source, createdAt, days: [{ date, title, mode, stops: [
//   { time, type, title, note?, food?, cost?, place?: { name, lat, lng, placeId? } } ] }] }
import { daysBetween } from "@/utils/dates";
import { SAMPLE_ITINERARIES } from "@/constants/itineraries";

// A Google Maps route takes an origin, a destination and up to 9 stops in between (in the app)
const MAX_ROUTE_POINTS = 11;
// Farther than this from the next stop, a first or last stop is out of town (the airport)
const OUT_OF_TOWN_KM = 8;
// Walking estimate without a routing service: streets are about 30% longer than the straight line, at 4.8 km/h
const STREET_FACTOR = 1.3;
const WALKING_KMH = 4.8;

// Distance in km between two places (haversine)
function km(from, to) {
  const radians = Math.PI / 180;
  const haversine =
    Math.sin(((to.lat - from.lat) * radians) / 2) ** 2 +
    Math.cos(from.lat * radians) * Math.cos(to.lat * radians) * Math.sin(((to.lng - from.lng) * radians) / 2) ** 2;
  return 12742 * Math.asin(Math.sqrt(haversine));
}

// The places of a day without an out-of-town first or last stop (arriving from or leaving for the
// airport by train or taxi): the part you walk, and what the map frames.
export function inTown(places) {
  let list = places;
  while (list.length > 2 && km(list[0], list[1]) > OUT_OF_TOWN_KM) list = list.slice(1);
  while (list.length > 2 && km(list.at(-1), list.at(-2)) > OUT_OF_TOWN_KM) list = list.slice(0, -1);
  return list;
}

// Approximate minutes on foot between two places (rounded to 5), or null if they are too far apart to walk
export function walkingMinutes(from, to) {
  const distance = km(from, to);
  if (distance > OUT_OF_TOWN_KM) return null;
  return Math.max(5, Math.round(((distance * STREET_FACTOR) / WALKING_KMH) * 12) * 5);
}

// A day ready to show: stops with places numbered as on the map, each with the walk to the next place
// (on walking days), the map points and the Google Maps route links.
export function dayPlan(day) {
  const walking = day.mode === "walking" || !day.mode;
  let placeCount = 0;
  const stops = day.stops.map((stop) => ({ ...stop, number: stop.place ? ++placeCount : null }));
  const places = stops.filter((stop) => stop.place);
  places.forEach((stop, index) => {
    const next = places[index + 1];
    if (walking && next) stop.walkToNext = walkingMinutes(stop.place, next.place);
  });
  const mapStops = places.map((stop) => ({ number: stop.number, name: stop.place.name, lat: stop.place.lat, lng: stop.place.lng }));
  // On foot the map frames the town (no airport); by car or train, every stop
  return { stops, mapStops, focus: walking ? inTown(mapStops) : mapStops, routes: routeUrls(day) };
}

// Opens the exact place in Google Maps (the app on phones). With a place ID it opens the place's own page.
export function placeUrl(place) {
  const url = `https://www.google.com/maps/search/?api=1&query=${place.lat},${place.lng}`;
  return place.placeId ? `${url}&query_place_id=${place.placeId}` : url;
}

// The day's route in Google Maps, stops in the order of the plan. Longer days are split into legs
// (each leg starts where the previous one ended).
// On foot, the airport legs are left out (inTown).
export function routeUrls(day) {
  const places = day.stops.filter((stop) => stop.place).map((stop) => stop.place);
  const walking = day.mode === "walking" || !day.mode;
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
}

// Until the AI is connected: a real hand-made itinerary (Rome or Bari) fitted to the trip's dates.
// Other cities get Rome's, marked as an example.
export function sampleItinerary(trip) {
  const sample = SAMPLE_ITINERARIES[trip.fare.code] ?? SAMPLE_ITINERARIES.FCO;
  const dates = daysBetween(trip.fare.day, trip.fare.ret?.day ?? trip.fare.day);
  return {
    source: SAMPLE_ITINERARIES[trip.fare.code] ? "sample" : "sample-other-city",
    createdAt: new Date().toISOString(),
    days: dates.slice(0, sample.days.length).map((date, index) => ({ ...sample.days[index], date })),
  };
}
