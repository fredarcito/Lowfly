import { daysBetween } from "@/utils/dates";
import { MAX_TRIP_DAYS } from "@/constants/manualTrips";

// "2026-11-13" + "10:00" → comparable text; without a time, the start of the day
const momentOf = (day, time) => `${day}T${time || "00:00"}`;

// What is wrong with one town of the form (a key of texts.trips.manual.errors), or null
const problemOf = (stop, previous) => {
  if (!stop.place) return "city";
  if (!stop.arriveDay || !stop.leaveDay) return "dates";
  if (momentOf(stop.leaveDay, stop.leaveTime) < momentOf(stop.arriveDay, stop.arriveTime)) return "leaveBeforeArrive";
  if (previous?.leaveDay && momentOf(stop.arriveDay, stop.arriveTime) < momentOf(previous.leaveDay, previous.leaveTime)) return "overlap";
  return null;
};

// How many days the trip lasts, from the first arrival to the last departure (null until both are known)
export const tripDaysOf = (stops) => {
  const firstDay = stops[0].arriveDay;
  const lastDay = stops.at(-1).leaveDay;
  return firstDay && lastDay && lastDay >= firstDay ? daysBetween(firstDay, lastDay).length : null;
};

// What is wrong with each town (`each`), and whether the whole trip is too long
export const problemsOf = (stops) => {
  const each = stops.map((stop, index) => problemOf(stop, stops[index - 1]));
  const tooLong = tripDaysOf(stops) > MAX_TRIP_DAYS;
  return { each, tooLong, valid: !tooLong && each.every((problem) => !problem) };
};

// The form's towns as the trip keeps them (store/trips saveManualTrip)
export const savedStops = (stops) =>
  stops.map(({ place, arriveDay, arriveTime, leaveDay, leaveTime }) => ({
    city: place.name,
    region: place.region,
    country: place.country,
    countryCode: place.countryCode,
    lat: place.lat,
    lng: place.lng,
    code: place.code,
    arrive: { day: arriveDay, time: arriveTime || null },
    leave: { day: leaveDay, time: leaveTime || null },
  }));
