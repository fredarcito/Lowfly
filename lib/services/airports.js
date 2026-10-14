// Airports: where you can fly from
import { api } from "@/lib/services/client";

// Every airport you can fly from, with names in `lang`
export const getAirports = (lang, options) =>
  api.get("/airports", { params: { lang }, ...options }).then((response) => response.data.airports);

// Departure airport for a first visit, from the visitor's country (or time zone)
export const getDefaultOrigin = (timeZone, options) =>
  api.get("/origin", { params: { tz: timeZone }, ...options }).then((response) => response.data.origin);
