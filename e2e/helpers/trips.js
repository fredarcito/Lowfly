import { readFileSync } from "node:fs";
import { join } from "node:path";

// Trips as the app saves them, with dates counted from today (so the tests do not age)

// "2026-11-20" for `days` from today
export const dayFromNow = (days) => {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
};

// Playwright runs from the project's root
const fixture = (name) => JSON.parse(readFileSync(join(process.cwd(), "e2e/fixtures", name), "utf8"));

// AI itineraries made for real: Rome (4 days) and Florence → Venice (3 days)
export const ROME_ITINERARY = fixture("rome-itinerary.json");
export const FLORENCE_VENICE_ITINERARY = fixture("florence-venice-itinerary.json");

// A saved return flight from Malta to Catania, leaving in `inDays` days for 3 nights
export const flightTrip = ({ id = "mla-cta-test", inDays = 20, booked = false, itinerary = null, city = "Catania", code = "CTA" } = {}) => {
  const outDay = dayFromNow(inDays);
  const retDay = dayFromNow(inDays + 3);
  return {
    id,
    origin: "MLA",
    savedAt: new Date().toISOString(),
    booked,
    itinerary,
    fare: {
      code,
      city,
      country: "Italia",
      day: outDay,
      time: "06:05",
      airline: "ryanair",
      price: 69.65,
      cur: "EUR",
      nights: 3,
      hours: 71,
      out: { day: outDay, time: "06:05", arrive: "06:55", airline: "ryanair", price: 34.66 },
      ret: { day: retDay, time: "05:50", arrive: "06:40", airline: "ryanair", price: 34.99 },
    },
  };
};

// The same flight to Rome with its itinerary (the itinerary's days keep their own dates)
export const romeTrip = (options = {}) => flightTrip({ id: "bud-cia-test", city: "Roma", code: "CIA", itinerary: ROME_ITINERARY, ...options });

// A trip planned by hand: Florence, then Venice, starting in `inDays` days
export const manualTrip = ({ id = "manual-test", inDays = 30, itinerary = null } = {}) => {
  const days = [0, 1, 2].map((offset) => dayFromNow(inDays + offset));
  const stops = [
    { city: "Florencia", region: "Región de Toscana", country: "Italia", countryCode: "IT", lat: 43.77925, lng: 11.24626, code: null, arrive: { day: days[0], time: "10:00" }, leave: { day: days[1], time: "09:00" } },
    { city: "Venecia", region: "Región de Véneto", country: "Italia", countryCode: "IT", lat: 45.43713, lng: 12.33265, code: "VCE", arrive: { day: days[1], time: "11:30" }, leave: { day: days[2], time: "18:00" } },
  ];
  return {
    id,
    manual: true,
    origin: null,
    stops,
    itinerary,
    booked: false,
    savedAt: new Date().toISOString(),
    fare: { code: "VCE", city: "Florencia → Venecia", country: "Italia", day: days[0], time: "10:00", ret: { day: days[2], time: "18:00" }, nights: 2 },
  };
};
