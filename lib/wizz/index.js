// Wizz Air public (unofficial) API. Only called from the server.
// Wizz changes the API version number with every deploy, so it is read from /buildnumber.
import { chunks } from "@/lib/dates";
import { countryName } from "@/lib/countries";

const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36";
const HEADERS = {
  "user-agent": UA,
  accept: "application/json",
  "accept-language": "es-ES,es;q=0.9",
  "content-type": "application/json",
  origin: "https://wizzair.com",
  referer: "https://wizzair.com/",
};
const FALLBACK_VERSION = "27.6.0"; // last resort; update it if it stops working

async function apiBase() {
  try {
    const r = await fetch("https://wizzair.com/buildnumber", { headers: { "user-agent": UA }, next: { revalidate: 21600 } });
    const m = (await r.text()).match(/be\.wizzair\.com\/([\d.]+)/);
    if (m) return `https://be.wizzair.com/${m[1]}/Api`;
  } catch {}
  return `https://be.wizzair.com/${FALLBACK_VERSION}/Api`;
}

// Wizz destinations from the departure airport
export async function destinations(origin, lang = "es") {
  const r = await fetch(`${await apiBase()}/asset/map?languageCode=${lang === "en" ? "en-gb" : "es-es"}`, { headers: HEADERS, next: { revalidate: 86400 } });
  if (!r.ok) throw new Error(`Wizz Air responded with error ${r.status}`);
  const { cities = [] } = await r.json();
  const byIata = Object.fromEntries(cities.map((c) => [c.iata, c]));
  const here = byIata[origin];
  if (!here) return [];
  return (here.connections || [])
    .map((c) => byIata[c.iata])
    .filter(Boolean)
    .map((c) => ({ airline: "wizz", code: c.iata, city: c.shortName, country: countryName(c.countryCode, c.countryName, lang) }));
}

// Cheapest price per day on a route (in 30-day chunks)
export async function daily(dep, arr, from, to) {
  const base = await apiBase();
  const list = [];
  for (const [a, b] of chunks(from, to, 30)) {
    const r = await fetch(`${base}/search/timetable`, {
      method: "POST",
      headers: HEADERS,
      body: JSON.stringify({
        flightList: [{ departureStation: dep, arrivalStation: arr, from: a, to: b }],
        priceType: "regular",
        adultCount: 1,
        childCount: 0,
        infantCount: 0,
      }),
      next: { revalidate: 600 },
    });
    if (!r.ok) throw new Error(`Wizz Air responded with error ${r.status}`);
    const d = await r.json();
    for (const f of d.outboundFlights || []) {
      if (f.priceType === "soldOut" || !f.price?.amount) continue;
      const day = f.departureDate.slice(0, 10);
      if (day < from || day > to) continue;
      list.push({ day, time: (f.departureDates?.[0] || "").slice(11, 16), price: f.price.amount, cur: f.price.currencyCode });
    }
  }
  return list;
}
