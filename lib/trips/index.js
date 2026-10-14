"use client";

// Saved trips ("My trips"), kept in localStorage while we are testing: no accounts or database yet.
// A trip is the flight the visitor saved plus, later, its itinerary.
// Components read them with useTrips() and update them with the functions below; every change is
// broadcast, so the header count and the lists refresh at once (also across tabs).
import { useSyncExternalStore } from "react";
import { nightsBetween, today } from "@/lib/dates";

const KEY = "lowfly.trips";
const CHANGE = "lowfly:trips";
const EMPTY = [];

let cache = { raw: null, list: EMPTY };

function read() {
  let raw = null;
  try {
    raw = localStorage.getItem(KEY);
  } catch {}
  if (raw !== cache.raw) {
    let list = EMPTY;
    try {
      list = raw ? JSON.parse(raw) : EMPTY;
    } catch {}
    cache = { raw, list: Array.isArray(list) ? list : EMPTY };
  }
  return cache.list;
}

function write(list) {
  try {
    localStorage.setItem(KEY, JSON.stringify(list));
  } catch {} // private mode or full: the change only lives until reload
  cache = { raw: null, list };
  window.dispatchEvent(new Event(CHANGE));
}

function subscribe(onChange) {
  const onStorage = (event) => event.key === KEY && onChange();
  window.addEventListener(CHANGE, onChange);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener(CHANGE, onChange);
    window.removeEventListener("storage", onStorage);
  };
}

// Saved trips, soonest first. On the server (and before hydrating) there are none.
export const useTrips = () => useSyncExternalStore(subscribe, read, () => EMPTY);

// The same flight always gets the same id, so saving it twice does not duplicate it
export const tripId = (origin, fare) =>
  [origin, fare.code, fare.day, fare.time?.replace(":", ""), fare.ret?.day ?? "ow"].join("-").toLowerCase();

// fare: a result as the API returns it (one way, or with out/ret legs). origin: departure airport code.
export function saveTrip(origin, fare) {
  const id = tripId(origin, fare);
  const list = read();
  if (list.some((saved) => saved.id === id)) return id;
  const trip = { id, origin, fare, savedAt: new Date().toISOString(), booked: false, itinerary: null };
  write([...list, trip].sort((first, second) => (first.fare.day < second.fare.day ? -1 : 1)));
  return id;
}

export const removeTrip = (id) => write(read().filter((saved) => saved.id !== id));

export const updateTrip = (id, changes) =>
  write(read().map((saved) => (saved.id === id ? { ...saved, ...changes } : saved)));

// Last day of the trip: the return flight, or the outbound one for a one-way trip
export const lastDay = (trip) => trip.fare.ret?.day ?? trip.fare.day;

// Not over yet (today counts)
export const isUpcoming = (trip) => lastDay(trip) >= today();

// Days until the outbound flight: 0 today, negative once it has left
export const daysUntil = (trip) => nightsBetween(today(), trip.fare.day);
