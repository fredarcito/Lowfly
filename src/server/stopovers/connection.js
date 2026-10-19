// How long between two flights on separate tickets at the hub, and what that makes: a same-day connection (time to
// get out and check in again), a long stop (a night, under a day) or a getaway (a whole day or more). The data must
// be sure enough. Ryanair gives each day's
// cheapest flight with its arrival; Wizz Air gives every departure of the day but neither the arrival nor which
// flight the price is (its real flight search blocks servers), so the check takes the worst case: the latest
// departure, an arrival estimated from the distance, and every departure of the next flight. Prices seen in recent
// searches (Travelpayouts, `cached`) are never joined the same day. Only called from the server.
import { distanceKm } from "@/utils/geo";
import { nightsBetween, shift } from "@/utils/dates";
import { minutesOfDay, utcOffsetMinutes } from "@/utils/flightTime";

// The shortest stay at the hub between landing and the next departure (hand luggage only)
export const MIN_CONNECTION_MINUTES = 150;
// Longer than this the same day is not a connection anymore
export const MAX_CONNECTION_MINUTES = 12 * 60;
// The shortest stay in the hub's city that makes a getaway: a whole day. Shorter, even with a night, it is a long stop.
export const MIN_GETAWAY_MINUTES = 24 * 60;
// Flight time from the distance: cruising speed plus taxiing, climbing and landing
const estimatedFlightMinutes = (km) => Math.round((km / 780) * 60 + 35);
// Extra margin when the arrival is estimated
const ESTIMATE_MARGIN_MINUTES = 30;

// An airport's time zone: its own (Ryanair's airports), or its country's when the country has only one
const countryZones = new Map();
export const zoneOf = (airport) => {
  if (!airport) return null;
  if (airport.tz) return airport.tz;
  if (!countryZones.has(airport.countryCode)) {
    let zones = [];
    try {
      const locale = new Intl.Locale(`und-${airport.countryCode}`);
      zones = locale.getTimeZones?.() ?? locale.timeZones ?? [];
    } catch {}
    countryZones.set(airport.countryCode, zones.length === 1 ? zones[0] : null);
  }
  return countryZones.get(airport.countryCode);
};

// The departure times a fare may be: every flight of the day when the price could be any of them (Wizz)
const departuresOf = (fare) => (fare.times?.length ? fare.times : fare.time ? [fare.time] : []);

// The latest the flight may land, in minutes from the hub's local midnight of its day (more than 1440: the next
// day), or null when it cannot be known
const latestLanding = (fare, from, to) => {
  const departures = departuresOf(fare);
  const fromZone = zoneOf(from);
  const toZone = zoneOf(to);
  if (fare.arrive && departures.length === 1) {
    let landing = minutesOfDay(fare.arrive);
    // Landing before taking off (local times): after midnight, unless the time zones explain it
    const zoneShift = fromZone && toZone ? utcOffsetMinutes(toZone, fare.day) - utcOffsetMinutes(fromZone, fare.day) : 0;
    if (landing < minutesOfDay(departures[0]) + zoneShift) landing += 24 * 60;
    return landing;
  }
  const km = distanceKm(from, to);
  if (!departures.length || !fromZone || !toZone || km == null) return null;
  const latest = Math.max(...departures.map(minutesOfDay));
  return latest - utcOffsetMinutes(fromZone, fare.day) + utcOffsetMinutes(toZone, fare.day) + estimatedFlightMinutes(km) + ESTIMATE_MARGIN_MINUTES;
};

// The day a flight lands: the next one when it lands after midnight (a 22:00 flight landing at 00:25)
export const landingDay = (fare, airportsByCode) => {
  const landing = latestLanding(fare, airportsByCode.get(fare.from), airportsByCode.get(fare.to));
  return landing != null && landing >= 24 * 60 ? shift(fare.day, Math.floor(landing / (24 * 60))) : fare.day;
};

// When a flight with no arrival time (Wizz) is likely to land, local time "HH:MM": its departure plus the flight
// time estimated from the distance. null when the day has several flights (which one is the price's is not known)
// or a time zone is missing.
export const estimatedArrival = (fare, from, to) => {
  const departures = departuresOf(fare);
  const fromZone = zoneOf(from);
  const toZone = zoneOf(to);
  const km = distanceKm(from, to);
  if (departures.length !== 1 || !fromZone || !toZone || km == null) return null;
  const local = minutesOfDay(departures[0]) - utcOffsetMinutes(fromZone, fare.day) + utcOffsetMinutes(toZone, fare.day) + estimatedFlightMinutes(km);
  const minutes = ((local % 1440) + 1440) % 1440;
  return `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;
};

// Minutes in the hub's city between landing (`arriving`) and taking off again (`departing`), on any days, in the
// worst case (the latest landing, the earliest departure), or null when the times cannot be known
export const stayMinutes = (arriving, departing, airportsByCode) => {
  const landing = latestLanding(arriving, airportsByCode.get(arriving.from), airportsByCode.get(arriving.to));
  const departures = departuresOf(departing);
  if (landing == null || !departures.length) return null;
  return nightsBetween(arriving.day, departing.day) * 24 * 60 + Math.min(...departures.map(minutesOfDay)) - landing;
};

// Minutes at the hub between `arriving` and `departing` (fares with from / to codes, the same day) in the worst
// case, or null when they cannot be joined: not live, another airport, or times unknown
export const connectionMinutes = (arriving, departing, airportsByCode) => {
  if (arriving.cached || departing.cached || arriving.to !== departing.from || arriving.day !== departing.day) return null;
  return stayMinutes(arriving, departing, airportsByCode);
};

// A whole day or more in the city (`nights` after landing). Without the times, two nights are surely a day.
export const isGetaway = (arriving, departing, nights, airportsByCode) => {
  const minutes = stayMinutes(arriving, departing, airportsByCode);
  return minutes == null ? nights >= 2 : minutes >= MIN_GETAWAY_MINUTES;
};

// Do they make a same-day connection with time enough?
export const connects = (arriving, departing, airportsByCode) => {
  const minutes = connectionMinutes(arriving, departing, airportsByCode);
  return minutes != null && minutes >= MIN_CONNECTION_MINUTES && minutes <= MAX_CONNECTION_MINUTES;
};
