import { daysBetween, isDay } from "@/utils/dates";
import { MAX_STOPS, MAX_TRIP_DAYS } from "@/constants/manualTrips";

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

// Towns for a link to the planner (?stops=…), each { code, arriveDay, arriveTime, leaveDay, leaveTime } (days and
// times may be empty): "ZAG,2026-11-26,07:55,2026-11-28,17:55;BSL,2026-11-28,19:30,2026-11-30,07:50"
export const stopsParam = (stops) =>
  stops.map((stop) => [stop.code, stop.arriveDay, stop.arriveTime, stop.leaveDay, stop.leaveTime].map((part) => part ?? "").join(",")).join(";");

const isTime = (text) => /^\d{2}:\d{2}$/.test(text);

// The form offers times every half hour: an arrival is rounded up (07:55 → 08:00) and a departure down
// (17:55 → 17:30), so the itinerary never counts on time there is not
const toHalfHour = (time, up) => {
  if (!isTime(time)) return "";
  const minutes = Number(time.slice(0, 2)) * 60 + Number(time.slice(3, 5));
  const rounded = Math.min((up ? Math.ceil(minutes / 30) : Math.floor(minutes / 30)) * 30, 23 * 60 + 30);
  return `${String(Math.floor(rounded / 60)).padStart(2, "0")}:${String(rounded % 60).padStart(2, "0")}`;
};

// The towns of a ?stops=… link, the invalid parts left empty and at most MAX_STOPS: [{ code, arriveDay, … }]
export const stopsFromParam = (text) =>
  String(text ?? "")
    .split(";")
    .map((part) => part.split(","))
    .filter(([code]) => /^[A-Z]{3}$/.test(code ?? ""))
    .slice(0, MAX_STOPS)
    .map(([code, arriveDay, arriveTime, leaveDay, leaveTime]) => ({
      code,
      arriveDay: isDay(arriveDay) ? arriveDay : "",
      arriveTime: toHalfHour(arriveTime, true),
      leaveDay: isDay(leaveDay) ? leaveDay : "",
      leaveTime: toHalfHour(leaveTime, false),
    }));
