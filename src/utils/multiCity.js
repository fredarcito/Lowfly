// A multi-city trip from the search (server/multiCity): its towns with their days, for the planner and for "Save trip"
import { shift } from "@/utils/dates";

// How many days a trip lasts: landing on the 14th and flying home on the 21st is 8 days
export const tripDays = (trip) => trip.nights + 1;

// Every town with the days you are there, from landing (the flight in) to flying home: each town its nights, the
// first with the flight's arrival time and the last with the flight home's departure.
// [{ ...town, arriveDay, arriveTime, leaveDay, leaveTime }] (times empty when unknown)
export const townDaysOf = (trip) => {
  const [flightIn, flightHome] = trip.legs;
  let day = flightIn.arriveDay ?? flightIn.day;
  return trip.towns.map((town, index) => {
    const first = index === 0;
    const last = index === trip.towns.length - 1;
    const arriveDay = day;
    const leaveDay = last ? flightHome.day : shift(day, town.nights);
    day = leaveDay;
    return {
      ...town,
      arriveDay,
      arriveTime: first ? (flightIn.arrive ?? flightIn.arriveEstimate ?? "") : "",
      leaveDay,
      leaveTime: last ? (flightHome.time ?? "") : "",
    };
  });
};

// The towns for the planner (utils/manualTrips stopsParam): a route's town goes by its place in the route
// (`ref`), so towns with no airport go too
export const plannerTownsOf = (trip) =>
  townDaysOf(trip).map((town) => ({ code: town.ref, arriveDay: town.arriveDay, arriveTime: town.arriveTime, leaveDay: town.leaveDay, leaveTime: town.leaveTime }));

// The towns as a saved trip keeps them (store/trips saveTrip, like a trip planned by hand)
export const savedTownsOf = (trip) =>
  townDaysOf(trip).map((town) => ({
    city: town.city,
    region: null,
    country: town.country,
    countryCode: town.countryCode,
    lat: town.lat,
    lng: town.lng,
    code: town.code,
    arrive: { day: town.arriveDay, time: town.arriveTime || null },
    leave: { day: town.leaveDay, time: town.leaveTime || null },
  }));
