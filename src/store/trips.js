// Saved trips ("My trips"), kept in localStorage while we are testing: no accounts or database yet.
// A trip is the flight the visitor saved plus, later, its itinerary.
// Components read them with the useTrips() hook and change them with the functions below; every change
// is broadcast, so the header count and the lists refresh at once (also across tabs).
import { nightsBetween, today } from "@/utils/dates";

const KEY = "lowfly.trips";
const CHANGE = "lowfly:trips";
export const NO_TRIPS = [];

let cache = { raw: null, list: NO_TRIPS };

export const readTrips = () => {
  let raw = null;
  try {
    raw = localStorage.getItem(KEY);
  } catch {}
  if (raw !== cache.raw) {
    let list = NO_TRIPS;
    try {
      list = raw ? JSON.parse(raw) : NO_TRIPS;
    } catch {}
    cache = { raw, list: Array.isArray(list) ? list : NO_TRIPS };
  }
  return cache.list;
};

const write = (list) => {
  try {
    localStorage.setItem(KEY, JSON.stringify(list));
  } catch {} // private mode or full: the change only lives until reload
  cache = { raw: null, list };
  window.dispatchEvent(new Event(CHANGE));
};

export const subscribeToTrips = (onChange) => {
  const onStorage = (event) => event.key === KEY && onChange();
  window.addEventListener(CHANGE, onChange);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener(CHANGE, onChange);
    window.removeEventListener("storage", onStorage);
  };
};


// The same flight always gets the same id, so saving it twice does not duplicate it
export const tripId = (origin, fare) =>
  [origin, fare.code, fare.day, fare.time?.replace(":", ""), fare.ret?.day ?? "ow"].join("-").toLowerCase();

// fare: a result as the API returns it (one way, or with out/ret legs). origin: departure airport code.
export const saveTrip = (origin, fare) => {
  const id = tripId(origin, fare);
  const list = readTrips();
  if (list.some((saved) => saved.id === id)) return id;
  const trip = { id, origin, fare, savedAt: new Date().toISOString(), booked: false, itinerary: null };
  write([...list, trip].sort((first, second) => (first.fare.day < second.fare.day ? -1 : 1)));
  return id;
};

// A trip planned by hand (any means of transport) through one or more towns, in order:
// stops: [{ city, region, country, countryCode, lat, lng, code, arrive: { day, time }, leave: { day, time } }]
// It has no flights: `fare` sums it up like a saved flight (first arrival, last departure, the towns), so the
// lists, the header and the itinerary treat both kinds alike.
export const saveManualTrip = (stops) => {
  const first = stops[0];
  const last = stops.at(-1);
  const id = `manual-${Date.now().toString(36)}`;
  const countries = [...new Set(stops.map((stop) => stop.country).filter(Boolean))];
  const fare = {
    // For the photo: the first town with an airport near it
    code: stops.find((stop) => stop.code)?.code ?? null,
    city: stops.map((stop) => stop.city).join(" → "),
    country: countries.join(", "),
    day: first.arrive.day,
    time: first.arrive.time,
    ret: { day: last.leave.day, time: last.leave.time },
    nights: nightsBetween(first.arrive.day, last.leave.day),
  };
  const trip = { id, manual: true, origin: null, stops, fare, savedAt: new Date().toISOString(), booked: false, itinerary: null };
  write([...readTrips(), trip].sort((one, other) => (one.fare.day < other.fare.day ? -1 : 1)));
  return id;
};

export const removeTrip = (id) => write(readTrips().filter((saved) => saved.id !== id));

export const updateTrip = (id, changes) =>
  write(readTrips().map((saved) => (saved.id === id ? { ...saved, ...changes } : saved)));

// Last day of the trip: the return flight, or the outbound one for a one-way trip
const lastDay = (trip) => trip.fare.ret?.day ?? trip.fare.day;

// Not over yet (today counts)
export const isUpcoming = (trip) => lastDay(trip) >= today();

// Days until the outbound flight: 0 today, negative once it has left
export const daysUntil = (trip) => nightsBetween(today(), trip.fare.day);
