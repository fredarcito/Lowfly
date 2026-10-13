// Wizz Air public (unofficial) API. Only called from the server.
// Wizz changes the API version number with every deploy, so it is read from its home page.
import { chunks, monthsBetween, nightsBetween, shift } from "@/lib/dates";
import { countryName } from "@/lib/countries";
import { eurRates, toEur } from "@/lib/fx";
import { WEEKEND, fits, noTimeOff } from "@/lib/weekend";

const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36";
const HEADERS = {
  "user-agent": UA,
  accept: "application/json",
  "accept-language": "es-ES,es;q=0.9",
  "content-type": "application/json",
  origin: "https://www.wizzair.com",
  referer: "https://www.wizzair.com/",
};
const FALLBACK_VERSION = "29.20.0"; // last resort; update it if it stops working
const VERSION_TTL = 6 * 3600 * 1000;

// The home page (~2 MB, too big for the fetch cache) links the API as be.wizzair.com/<version>/Api.
// The version is kept in memory for a few hours.
let version = { value: null, at: 0 };

async function apiBase() {
  if (!version.value || Date.now() - version.at > VERSION_TTL) {
    try {
      const r = await fetch("https://www.wizzair.com/en-gb", { headers: { "user-agent": UA }, cache: "no-store" });
      const m = (await r.text()).match(/be\.wizzair\.com\/([\d.]+)\/Api/);
      if (m) version = { value: m[1], at: Date.now() };
    } catch {}
  }
  return `https://be.wizzair.com/${version.value || FALLBACK_VERSION}/Api`;
}

// Wizz network: every city it flies from, with its connections
async function cities(lang) {
  const r = await fetch(`${await apiBase()}/asset/map?languageCode=${lang === "en" ? "en-gb" : "es-es"}`, { headers: HEADERS, next: { revalidate: 86400 } });
  if (!r.ok) throw new Error(`Wizz Air responded with error ${r.status}`);
  return (await r.json()).cities || [];
}

// Every airport Wizz flies from
export async function airports(lang = "es") {
  return (await cities(lang))
    .filter((c) => c.connections?.length && !c.isFakeStation)
    .map((c) => ({
      airline: "wizz",
      code: c.iata,
      name: c.shortName.trim(),
      city: c.shortName.trim(),
      country: countryName(c.countryCode, c.countryName, lang),
      countryCode: c.countryCode?.toUpperCase(),
      lat: c.latitude,
      lon: c.longitude,
    }));
}

// Wizz destinations from the departure airport
export async function destinations(origin, lang = "es") {
  const list = await cities(lang);
  const byIata = Object.fromEntries(list.map((c) => [c.iata, c]));
  const here = byIata[origin];
  if (!here) return [];
  // A connection can be a metropolitan area (ROM = every Rome airport): it is swapped for its real airports
  const real = (c) => (c.isFakeStation ? list.filter((x) => x.mac === c.iata && !x.isFakeStation) : [c]);
  return (here.connections || [])
    .map((c) => byIata[c.iata])
    .filter(Boolean)
    .flatMap(real)
    .map((c) => ({ airline: "wizz", code: c.iata, city: c.shortName.trim(), country: countryName(c.countryCode, c.countryName, lang) }));
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
      // `times`: every departure that day. The price is the day's cheapest, without saying which flight.
      const times = (f.departureDates || []).map((d) => d.slice(11, 16));
      list.push({ day, time: times[0] || "", times, price: f.price.amount, cur: f.price.currencyCode });
    }
  }
  return toEur(list);
}

// Wizz's own fare finder: the cheapest fare to every destination in a month, in a single request.
// For a return trip it is the cheapest pair within a stay bucket ("1-3 days", "4-8 days" or "anytime").
async function fareFinder(origin, month, duration) {
  const r = await fetch(`${await apiBase()}/search/SmartSearchCheapFlightsV2`, {
    method: "POST",
    headers: HEADERS,
    body: JSON.stringify({
      departureStations: [origin],
      arrivalStations: null,
      tripDuration: duration ?? "anytime",
      isReturnFlight: !!duration,
      stdPlan: [month.slice(0, 7)],
      pax: 1,
      dateFilterType: "Flexible",
      departureDate: null,
      returnDate: null,
    }),
    next: { revalidate: 600 },
  });
  if (!r.ok) throw new Error(`Wizz Air responded with error ${r.status}`);
  return (await r.json()).items || [];
}

// Stay buckets for a stay of min to max nights. "1 week" is exactly 7 nights;
// "anytime" only when part of the stay is longer than 8 nights.
function buckets({ min, max }) {
  if (min === 7 && max === 7) return ["1 week"];
  const list = [];
  if (min <= 3) list.push("1-3 days");
  if (min <= 8 && max >= 4) list.push("4-8 days");
  if (max > 8) list.push("anytime");
  return list;
}

const monthEnd = (month) => shift(shift(month.slice(0, 7) + "-01", 32).slice(0, 7) + "-01", -1);

// Cheapest Wizz fare (or return trip, with `stay`) to every destination between `from` and `to`.
// One fare finder request per month (and stay bucket). The finder only gives the cheapest fare of each month,
// so when that one falls outside the dates or the stay, a valid but pricier fare may exist that month.
// Those months go to `recheck` ({ code, from, to, price }), to be checked day by day, unless the destination
// already has a valid fare that is not more expensive (nothing in that month can beat it).
// With a weekend stay (lib/weekend) it uses Wizz's "weekend" bucket (Fri/Sat out, Sun/Mon back) and also checks the times.
export async function cheapest(origin, from, to, stay = null) {
  const lastOut = stay ? shift(to, -stay.min) : to;
  const kinds = !stay ? [null] : stay.weekend ? ["weekend"] : buckets(stay);
  const requests = monthsBetween(from, lastOut).flatMap((m) => kinds.map((b) => [m, b]));
  const pages = await Promise.all(requests.map(([m, b]) => fareFinder(origin, m, b).then((items) => ({ m, items }))));

  const needsRates = pages.some((p) => p.items.some((i) => i.regularPrice.currencyCode !== "EUR"));
  const fx = needsRates ? await eurRates() : { EUR: 1 };
  const eur = (p) => {
    if (!fx[p.currencyCode]) throw new Error(`No exchange rate for ${p.currencyCode}`);
    return Math.round((p.amount / fx[p.currencyCode]) * 100) / 100;
  };
  const leg = (f) => ({ airline: "wizz", day: f.std.slice(0, 10), time: f.std.slice(11, 16), price: eur(f.regularPrice) });

  const best = new Map();
  const office = new Map(); // weekend: cheapest per destination needing no time off
  const doubtful = [];
  for (const { m, items } of pages)
    for (const i of items) {
      const out = leg(i.outboundFlight);
      const ret = i.inboundFlight && leg(i.inboundFlight);
      const price = eur(i.regularPrice);
      const n = ret && nightsBetween(out.day, ret.day);
      const ok =
        out.day >= from &&
        out.day <= lastOut &&
        (!stay || (ret.day <= to && n >= stay.min && n <= stay.max)) &&
        (!stay?.weekend || (fits(WEEKEND.out, out.day, out.time) && fits(WEEKEND.ret, ret.day, ret.time)));
      if (!ok) {
        doubtful.push({ code: i.arrivalStation, month: m, price });
        continue;
      }
      const fare = { code: i.arrivalStation, ...out, price, cur: "EUR", ...(ret && { out, ret }) };
      if (!best.has(fare.code) || price < best.get(fare.code).price) best.set(fare.code, fare);
      if (stay?.weekend && noTimeOff(fare) && (!office.has(fare.code) || price < office.get(fare.code).price))
        office.set(fare.code, fare);
    }

  const recheck = new Map();
  for (const d of doubtful) {
    if (best.has(d.code) && best.get(d.code).price <= d.price) continue;
    const a = d.month > from ? d.month : from;
    const b = monthEnd(d.month) < lastOut ? monthEnd(d.month) : lastOut;
    const key = `${d.code} ${a}`;
    if (!recheck.has(key) || d.price < recheck.get(key).price) recheck.set(key, { code: d.code, from: a, to: b, price: d.price });
  }
  return { fares: [...new Set([...best.values(), ...office.values()])], recheck: [...recheck.values()] };
}
