// All the search logic. Runs on the server (route handlers).
import * as ryanair from "@/server/ryanair";
import * as wizz from "@/server/wizz";
import { getAirports } from "@/server/airports";
import { AppError } from "@/server/errors";
import { WEEKEND } from "@/constants/weekend";
import { fits, hoursAway, noTimeOff } from "@/utils/weekend";
import { tomorrow, shift, later, daysBetween, monthsBetween, nightsBetween } from "@/utils/dates";

const DAILY = { ryanair: ryanair.daily, wizz: wizz.daily };
// Most Wizz months checked day by day in a search, so Wizz does not block us (503) for too many requests
const MAX_RECHECKS = 20;
const minBy = (list) => list.reduce((a, b) => (b.price < a.price ? b : a));

// A return trip shaped like a regular fare (day/time/price/airline = the outbound ones),
// so the rest of the code can treat it like a one-way flight
const trip = (dest, out, ret, price = out.price + ret.price, cur = "EUR") => {
  return {
    code: dest.code,
    city: dest.city,
    country: dest.country,
    day: out.day,
    time: out.time,
    airline: out.airline,
    price,
    cur,
    out,
    ret,
    nights: nightsBetween(out.day, ret.day),
    hours: hoursAway(out, ret),
  };
};

// The cheapest return for an outbound flight, staying stay.min to stay.max nights
const bestReturn = (out, rets, stay) => {
  let best = null;
  for (const r of rets) {
    const n = nightsBetween(out.day, r.day);
    if (n >= stay.min && n <= stay.max && (!best || r.price < best.price)) best = r;
  }
  return best;
};

// Runs jobs at most `n` at a time and records which airline fails
const pool = async (jobs, failed, n = 6) => {
  const res = [];
  let i = 0;
  const worker = async () => {
    while (i < jobs.length) {
      const k = i++;
      try {
        res[k] = await jobs[k].run();
      } catch {
        res[k] = null;
        failed.add(jobs[k].airline);
      }
    }
  };
  await Promise.all(Array.from({ length: n }, worker));
  return res;
};

// Destinations from both airlines, merged by airport. The city comes from the airport list, where every
// airport of a city shares its name (Fiumicino and Ciampino are both "Roma"), and the country code with it.
export const getDestinations = async (origin, lang = "es") => {
  const [ry, wz, known] = await Promise.allSettled([
    ryanair.cheapest(origin, tomorrow(), shift(tomorrow(), 180), lang),
    wizz.destinations(origin, lang),
    getAirports(lang),
  ]);
  const failed = [];
  if (ry.status === "rejected") failed.push("ryanair");
  if (wz.status === "rejected") failed.push("wizz");
  const airportsByCode = new Map((known.value?.airports || []).map((airport) => [airport.code, airport]));

  const byCode = new Map();
  for (const d of [...(ry.value || []), ...(wz.value || [])]) {
    const airport = airportsByCode.get(d.code);
    const e = byCode.get(d.code) || {
      code: d.code,
      city: airport?.city ?? d.city,
      country: d.country,
      countryCode: airport?.countryCode ?? null,
      airlines: [],
    };
    if (!e.airlines.includes(d.airline)) e.airlines.push(d.airline);
    byCode.set(d.code, e);
  }
  if (!byCode.size && failed.length === 2) throw new AppError("noAirlines");
  return { origin, destinations: [...byCode.values()], failed };
};

// The airports of a country, or only those of one of its cities (`city` null: the whole country)
const airportsIn = async (origin, country, city, failed, lang) => {
  const { destinations, failed: f } = await getDestinations(origin, lang);
  f.forEach((a) => failed.add(a));
  const airports = destinations.filter((d) => d.country === country && (!city || d.city === city));
  if (!airports.length) throw new AppError("noRoutes", { origin, country: city ?? country }, 404);
  return airports;
};

// "Price per day" jobs for each airport and airline, in one direction
const dailyJobs = (origin, airports, dir, from, to) => {
  return airports.flatMap((a) =>
    a.airlines.map((al) => ({
      airline: al,
      run: async () => {
        const [dep, arr] = dir === "out" ? [origin, a.code] : [a.code, origin];
        const days = await DAILY[al](dep, arr, from, to);
        return days.map((f) => ({ ...f, airline: al, code: a.code, city: a.city, dir }));
      },
    }))
  );
};

/* ---------- Anywhere ---------- */
// `stay` = { min, max } nights for a return trip, or null for one way
export const everywhere = async (origin, from, to, max, stay = null, lang = "es") => {
  const failed = new Set();
  const { destinations, failed: f } = await getDestinations(origin, lang);
  f.forEach((a) => failed.add(a));

  const fares = [];
  try {
    if (stay) {
      const trips = stay.weekend
        ? await ryanair.weekendTrips(origin, from, to, lang)
        : await ryanair.roundTrip(origin, from, to, stay.min, stay.max, lang);
      fares.push(...trips.map((t) => trip(t, t.out, t.ret, t.price, t.cur)));
    } else {
      fares.push(...(await ryanair.cheapest(origin, from, to, lang)));
    }
  } catch {
    failed.add("ryanair");
  }

  // Wizz: its fare finder covers every destination in one request per month. Only the destinations
  // it could not settle (see wizz.cheapest) are checked day by day, a few at a time so Wizz does not block us.
  const wizzDests = new Map(destinations.filter((d) => d.airlines.includes("wizz")).map((d) => [d.code, d]));
  let recheck = [];
  try {
    const found = await wizz.cheapest(origin, from, to, stay);
    for (const f of found.fares) {
      const d = wizzDests.get(f.code);
      if (!d) continue;
      fares.push(stay ? trip(d, f.out, f.ret, f.price, f.cur) : { ...f, city: d.city, country: d.country });
    }
    // Not worth checking when a valid fare (any airline) is already at or below the month's cheapest.
    // The rest, cheapest first: those are the ones that can top the list.
    const known = new Map();
    for (const f of fares) if (!known.has(f.code) || f.price < known.get(f.code)) known.set(f.code, f.price);
    recheck = found.recheck
      .filter((r) => wizzDests.has(r.code) && !(known.get(r.code) <= r.price))
      .sort((a, b) => a.price - b.price)
      .slice(0, MAX_RECHECKS);
  } catch {
    failed.add("wizz");
  }

  // Each recheck is one month of one route: outbound days in [r.from, r.to], returns up to stay.max nights later
  const wizzJobs = recheck.map((r) => {
    const d = wizzDests.get(r.code);
    return {
      airline: "wizz",
      run: stay
        ? async () => {
            // Weekend: only days with a single flight that fits the slot (with several, the price could be another flight's)
            const sure = (slots) => (x) => !stay.weekend || (x.times.length === 1 && fits(slots, x.day, x.time));
            const tag = (list, slots) => list.filter(sure(slots)).map((x) => ({ ...x, airline: "wizz" }));
            const outs = tag(await wizz.daily(origin, d.code, r.from, r.to), WEEKEND.out);
            if (!outs.length) return null;
            const lastRet = shift(r.to, stay.max) < to ? shift(r.to, stay.max) : to;
            const rets = tag(await wizz.daily(d.code, origin, shift(r.from, stay.min), lastRet), WEEKEND.ret);
            let best = null;
            for (const o of outs) {
              const ret = bestReturn(o, rets, stay);
              if (ret && (!best || o.price + ret.price < best.price)) best = trip(d, o, ret, o.price + ret.price, o.cur);
            }
            return best;
          }
        : async () => {
            const days = await wizz.daily(origin, d.code, r.from, r.to);
            return days.length ? { ...minBy(days), airline: "wizz", code: d.code, city: d.city, country: d.country } : null;
          },
    };
  });
  fares.push(...(await pool(wizzJobs, failed, 3)).filter(Boolean));

  const byDest = new Map();
  const office = new Map(); // weekend: cheapest per destination needing no time off
  for (const fare of fares) {
    if (fare.price > max) continue;
    if (!byDest.has(fare.code) || fare.price < byDest.get(fare.code).price) byDest.set(fare.code, fare);
    if (stay?.weekend && noTimeOff(fare) && (!office.has(fare.code) || fare.price < office.get(fare.code).price))
      office.set(fare.code, fare);
  }
  const results = [...byDest.values()].map((f) =>
    office.has(f.code) && office.get(f.code) !== f ? { ...f, noTimeOffAlt: office.get(f.code) } : f
  );
  return {
    origin,
    roundTrip: !!stay,
    weekend: !!stay?.weekend,
    results: results.sort((a, b) => a.price - b.price),
    failed: [...failed],
  };
};

/* ---------- To a country (or one of its cities) ---------- */
// With `stay`, each calendar day is the cheapest return trip leaving that day
export const country = async (origin, countryName, cityName, from, to, max, stay = null, lang = "es") => {
  const failed = new Set();
  const airports = await airportsIn(origin, countryName, cityName, failed, lang);
  const jobs = stay
    ? [
        ...dailyJobs(origin, airports, "out", from, shift(to, -stay.min)),
        ...dailyJobs(origin, airports, "ret", shift(from, stay.min), to),
      ]
    : dailyJobs(origin, airports, "out", from, to);
  const res = await pool(jobs, failed);
  if (res.every((r) => !r)) throw new AppError("noPrices");

  let fares = res.filter(Boolean).flat();
  if (stay) {
    // Per airport, each outbound flight with its best return (may mix airlines)
    const per = new Map();
    for (const f of fares) {
      if (!per.has(f.code)) per.set(f.code, { code: f.code, city: f.city, country: countryName, out: [], ret: [] });
      per.get(f.code)[f.dir].push(f);
    }
    fares = [];
    for (const a of per.values())
      for (const o of a.out) {
        const r = bestReturn(o, a.ret, stay);
        if (r) fares.push(trip(a, o, r, o.price + r.price, o.cur));
      }
  }

  const byDay = new Map();
  const byAirport = new Map();
  for (const f of fares) {
    if (f.price > max) continue;
    if (!byDay.has(f.day) || f.price < byDay.get(f.day).price) byDay.set(f.day, f);
    if (!byAirport.has(f.code) || f.price < byAirport.get(f.code).price) byAirport.set(f.code, f);
  }
  const days = [...byDay.values()].sort((a, b) => a.price - b.price);

  return {
    origin,
    roundTrip: !!stay,
    country: countryName,
    city: cityName,
    from,
    to,
    months: monthsBetween(from, to),
    byDay: Object.fromEntries(byDay),
    best: days[0] || null,
    others: days.slice(1, 6),
    airports: [...byAirport.values()].sort((a, b) => a.price - b.price),
    min: days[0]?.price ?? 0,
    max: days[days.length - 1]?.price ?? 0,
    failed: [...failed],
  };
};

/* ---------- Flexible dates ---------- */
export const flexible = async (origin, countryName, cityName, ida, vuelta, flex, lang = "es") => {
  const failed = new Set();
  const airports = await airportsIn(origin, countryName, cityName, failed, lang);

  const oFrom = later(shift(ida, -flex), tomorrow());
  const oTo = shift(ida, flex);
  const rFrom = later(shift(vuelta, -flex), tomorrow());
  const rTo = shift(vuelta, flex);
  if (oTo < tomorrow()) throw new AppError("outPast", {}, 400);

  const res = await pool(
    [...dailyJobs(origin, airports, "out", oFrom, oTo), ...dailyJobs(origin, airports, "ret", rFrom, rTo)],
    failed
  );
  if (res.every((r) => !r)) throw new AppError("noPrices");

  // Per airport: cheapest outbound and return flight each day (may mix airlines)
  const per = new Map();
  for (const f of res.filter(Boolean).flat()) {
    if (!per.has(f.code)) per.set(f.code, { city: f.city, out: new Map(), ret: new Map() });
    const m = per.get(f.code)[f.dir];
    if (!m.has(f.day) || f.price < m.get(f.day).price) m.set(f.day, f);
  }

  // Best outbound + return combination for each pair of dates
  const combos = new Map();
  for (const [code, a] of per)
    for (const [o, of] of a.out)
      for (const [r, rf] of a.ret) {
        if (r <= o) continue;
        const total = of.price + rf.price;
        const key = `${o}|${r}`;
        if (!combos.has(key) || total < combos.get(key).total)
          combos.set(key, { o, r, total, code, city: a.city, out: of, ret: rf });
      }

  const sorted = [...combos.values()].sort((a, b) => a.total - b.total);
  const base = combos.get(`${ida}|${vuelta}`) || null;

  // Alternatives: the ones that save money first; if none, the cheapest ones
  const others = sorted.filter((c) => c !== base);
  const cheaper = base ? others.filter((c) => c.total < base.total - 0.5) : others;
  const kind = !base ? "noBase" : cheaper.length ? "cheaper" : "pricier";

  return {
    origin,
    country: countryName,
    city: cityName,
    ida,
    vuelta,
    outDays: daysBetween(oFrom, oTo),
    retDays: daysBetween(rFrom, rTo),
    combos: Object.fromEntries(combos),
    base,
    top: sorted[0] || null,
    alternatives: (cheaper.length ? cheaper : others).slice(0, 6),
    alternativesKind: kind,
    min: sorted[0]?.total ?? 0,
    max: sorted[sorted.length - 1]?.total ?? 0,
    failed: [...failed],
  };
};
