// Every airport you can fly from with Ryanair or Wizz Air. Only called from the server.
import * as ryanair from "@/server/ryanair";
import * as wizz from "@/server/wizz";
import { DEFAULT_ORIGIN } from "@/constants/airports";

export async function getAirports(lang = "es") {
  const [ry, wz] = await Promise.allSettled([ryanair.airports(lang), wizz.airports(lang)]);
  const byCode = new Map();
  // Ryanair first: its data is richer (time zone, the country's main airport)
  for (const { airline, ...a } of [...(ry.value || []), ...(wz.value || [])]) {
    const e = byCode.get(a.code);
    if (e) e.airlines.push(airline);
    else byCode.set(a.code, { ...a, airlines: [airline] });
  }
  if (!byCode.size) throw new Error("No airline returned its airports");
  return { airports: [...byCode.values()] };
}

// Departure airport for a first visit: the main airport of the visitor's country if we fly from it,
// otherwise Malta. The country comes from Vercel (IP geolocation); without it (local development)
// from the browser's time zone.
export async function defaultOrigin(country, tz) {
  const { airports } = await getAirports("en");
  const code = (country || airports.find((a) => tz && a.tz === tz)?.countryCode || "").toUpperCase();
  const here = airports.filter((a) => a.countryCode === code);
  return { country: code || null, origin: (here.find((a) => a.main) || here[0])?.code ?? DEFAULT_ORIGIN };
}
