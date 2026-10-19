import { MAX_STOPS, MAX_TRIP_DAYS } from "@/constants/manualTrips";
import { daysBetween } from "@/utils/dates";

// A trip through a hub (server/stopovers) split by direction: the flights there (to the destination) and back, each
// with the stops between its flights: { out: { legs, stops }, back: { legs, stops } | null }
export const directionsOf = (trip) => {
  const arrival = trip.legs.findIndex((leg) => leg.to === trip.code);
  const part = (from, to) => ({ legs: trip.legs.slice(from, to + 1), stops: trip.stops.slice(from, to) });
  return { out: part(0, arrival), back: arrival < trip.legs.length - 1 ? part(arrival + 1, trip.legs.length - 1) : null };
};

// The towns of a trip through a hub where you spend a whole day or more (a getaway, the destination; not a long stop
// of a night), with its flights' days and times:
// [{ code, city, arriveDay, arriveTime, leaveDay, leaveTime }] (times empty when unknown). One way, the destination
// has its arrival only.
const townsOf = (trip) => {
  const towns = trip.stops
    .map((stop, index) => ({ stop, landing: trip.legs[index], leaving: trip.legs[index + 1] }))
    .filter(({ stop }) => stop.type === "stay")
    .map(({ stop, landing, leaving }) => ({
      code: stop.code,
      city: stop.city,
      arriveDay: landing.arriveDay ?? landing.day,
      arriveTime: landing.arrive ?? "",
      leaveDay: leaving.day,
      leaveTime: leaving.time ?? "",
    }));
  const last = trip.legs.at(-1);
  if (last.to === trip.code)
    towns.push({ code: trip.code, city: trip.city, arriveDay: last.arriveDay ?? last.day, arriveTime: last.arrive ?? "", leaveDay: "", leaveTime: "" });
  return towns;
};

// The towns for the planner (utils/manualTrips stopsParam), or null when it cannot take them (too many towns or days)
export const plannerStopsOf = (trip) => {
  const towns = townsOf(trip);
  if (!towns.length || towns.length > MAX_STOPS) return null;
  const lastDay = towns.at(-1).leaveDay || towns.at(-1).arriveDay;
  return daysBetween(towns[0].arriveDay, lastDay).length > MAX_TRIP_DAYS ? null : towns;
};

// The towns as a saved trip keeps them (store/trips, like a trip planned by hand), with each airport's place from
// `airportsByCode` (Map code → airport). One way, the destination is left the day you land. null while an airport is
// not known yet.
export const savedStopsOf = (trip, airportsByCode) => {
  const stops = townsOf(trip).map((town) => {
    const airport = airportsByCode.get(town.code);
    if (!airport || airport.lat == null) return null;
    return {
      city: airport.city,
      region: null,
      country: airport.country,
      countryCode: airport.countryCode,
      lat: airport.lat,
      lng: airport.lon,
      code: town.code,
      arrive: { day: town.arriveDay, time: town.arriveTime || null },
      leave: { day: town.leaveDay || town.arriveDay, time: town.leaveTime || null },
    };
  });
  return stops.every(Boolean) ? stops : null;
};
