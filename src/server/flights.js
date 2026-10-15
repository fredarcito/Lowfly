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
const minBy = (list) => list.reduce((cheapest, candidate) => (candidate.price < cheapest.price ? candidate : cheapest));

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
  for (const ret of rets) {
    const nights = nightsBetween(out.day, ret.day);
    if (nights >= stay.min && nights <= stay.max && (!best || ret.price < best.price)) best = ret;
  }
  return best;
};

// Does a day's cheapest flight (dir: out | ret) leave in a weekend slot?
const fitsWeekend = (flight) =>
  (!flight.times || flight.times.length === 1) && fits(flight.dir === "out" ? WEEKEND.out : WEEKEND.ret, flight.day, flight.time);

// Runs jobs at most `n` at a time and records which airline fails
const pool = async (jobs, failed, concurrency = 6) => {
  const res = [];
  let nextJob = 0;
  const worker = async () => {
    while (nextJob < jobs.length) {
      const jobIndex = nextJob++;
      try {
        res[jobIndex] = await jobs[jobIndex].run();
      } catch {
        res[jobIndex] = null;
        failed.add(jobs[jobIndex].airline);
      }
    }
  };
  await Promise.all(Array.from({ length: concurrency }, worker));
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
  for (const destination of [...(ry.value || []), ...(wz.value || [])]) {
    const airport = airportsByCode.get(destination.code);
    const entry = byCode.get(destination.code) || {
      code: destination.code,
      city: airport?.city ?? destination.city,
      country: destination.country,
      countryCode: airport?.countryCode ?? null,
      airlines: [],
    };
    if (!entry.airlines.includes(destination.airline)) entry.airlines.push(destination.airline);
    byCode.set(destination.code, entry);
  }
  if (!byCode.size && failed.length === 2) throw new AppError("noAirlines");
  return { origin, destinations: [...byCode.values()], failed };
};

// The airports of a country, or only those of one of its cities (`city` null: the whole country)
const airportsIn = async (origin, country, city, failed, lang) => {
  const { destinations, failed: failedAirlines } = await getDestinations(origin, lang);
  failedAirlines.forEach((airline) => failed.add(airline));
  const airports = destinations.filter((destination) => destination.country === country && (!city || destination.city === city));
  if (!airports.length) throw new AppError("noRoutes", { origin, country: city ?? country }, 404);
  return airports;
};

// "Price per day" jobs for each airport and airline, in one direction
const dailyJobs = (origin, airports, dir, from, to) => {
  return airports.flatMap((airport) =>
    airport.airlines.map((al) => ({
      airline: al,
      run: async () => {
        const [dep, arr] = dir === "out" ? [origin, airport.code] : [airport.code, origin];
        const days = await DAILY[al](dep, arr, from, to);
        return days.map((fare) => ({ ...fare, airline: al, code: airport.code, city: airport.city, dir }));
      },
    }))
  );
};

/* ---------- Anywhere ---------- */
// `stay` = { min, max } nights for a return trip, or null for one way
export const everywhere = async (origin, from, to, max, stay = null, lang = "es") => {
  const failed = new Set();
  const { destinations, failed: failedAirlines } = await getDestinations(origin, lang);
  failedAirlines.forEach((airline) => failed.add(airline));

  const fares = [];
  try {
    if (stay) {
      const trips = stay.weekend
        ? await ryanair.weekendTrips(origin, from, to, lang)
        : await ryanair.roundTrip(origin, from, to, stay.min, stay.max, lang);
      fares.push(...trips.map((weekendTrip) => trip(weekendTrip, weekendTrip.out, weekendTrip.ret, weekendTrip.price, weekendTrip.cur)));
    } else {
      fares.push(...(await ryanair.cheapest(origin, from, to, lang)));
    }
  } catch {
    failed.add("ryanair");
  }

  // Wizz: its fare finder covers every destination in one request per month. Only the destinations
  // it could not settle (see wizz.cheapest) are checked day by day, a few at a time so Wizz does not block us.
  const wizzDests = new Map(destinations.filter((destination) => destination.airlines.includes("wizz")).map((destination) => [destination.code, destination]));
  let recheck = [];
  try {
    const found = await wizz.cheapest(origin, from, to, stay);
    for (const fare of found.fares) {
      const destination = wizzDests.get(fare.code);
      if (!destination) continue;
      fares.push(stay ? trip(destination, fare.out, fare.ret, fare.price, fare.cur) : { ...fare, city: destination.city, country: destination.country });
    }
    // Not worth checking when a valid fare (any airline) is already at or below the month's cheapest.
    // The rest, cheapest first: those are the ones that can top the list.
    const known = new Map();
    for (const fare of fares) if (!known.has(fare.code) || fare.price < known.get(fare.code)) known.set(fare.code, fare.price);
    recheck = found.recheck
      .filter((recheckMonth) => wizzDests.has(recheckMonth.code) && !(known.get(recheckMonth.code) <= recheckMonth.price))
      .sort((first, second) => first.price - second.price)
      .slice(0, MAX_RECHECKS);
  } catch {
    failed.add("wizz");
  }

  // Each recheck is one month of one route: outbound days in [r.from, r.to], returns up to stay.max nights later
  const wizzJobs = recheck.map((recheckMonth) => {
    const destination = wizzDests.get(recheckMonth.code);
    return {
      airline: "wizz",
      run: stay
        ? async () => {
            // Weekend: only days with a single flight that fits the slot (with several, the price could be another flight's)
            const sure = (slots) => (flight) => !stay.weekend || (flight.times.length === 1 && fits(slots, flight.day, flight.time));
            const tag = (list, slots) => list.filter(sure(slots)).map((flight) => ({ ...flight, airline: "wizz" }));
            const outs = tag(await wizz.daily(origin, destination.code, recheckMonth.from, recheckMonth.to), WEEKEND.out);
            if (!outs.length) return null;
            const lastRet = shift(recheckMonth.to, stay.max) < to ? shift(recheckMonth.to, stay.max) : to;
            const rets = tag(await wizz.daily(destination.code, origin, shift(recheckMonth.from, stay.min), lastRet), WEEKEND.ret);
            let best = null;
            for (const out of outs) {
              const ret = bestReturn(out, rets, stay);
              if (ret && (!best || out.price + ret.price < best.price)) best = trip(destination, out, ret, out.price + ret.price, out.cur);
            }
            return best;
          }
        : async () => {
            const days = await wizz.daily(origin, destination.code, recheckMonth.from, recheckMonth.to);
            return days.length ? { ...minBy(days), airline: "wizz", code: destination.code, city: destination.city, country: destination.country } : null;
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
  const results = [...byDest.values()].map((fare) =>
    office.has(fare.code) && office.get(fare.code) !== fare ? { ...fare, noTimeOffAlt: office.get(fare.code) } : fare
  );
  return {
    origin,
    roundTrip: !!stay,
    weekend: !!stay?.weekend,
    results: results.sort((first, second) => first.price - second.price),
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
  if (res.every((result) => !result)) throw new AppError("noPrices");

  // A weekend away: only flights that leave in the weekend slots (constants/weekend). A day's price is its cheapest
  // flight, so a day whose cheapest leaves at another time is left out; for Wizz, only days with one flight (with
  // several, the price could be another flight's)
  let fares = res.filter(Boolean).flat();
  if (stay?.weekend) fares = fares.filter(fitsWeekend);
  if (stay) {
    // Per airport, each outbound flight with its best return (may mix airlines)
    const per = new Map();
    for (const fare of fares) {
      if (!per.has(fare.code)) per.set(fare.code, { code: fare.code, city: fare.city, country: countryName, out: [], ret: [] });
      per.get(fare.code)[fare.dir].push(fare);
    }
    fares = [];
    for (const airport of per.values())
      for (const out of airport.out) {
        const ret = bestReturn(out, airport.ret, stay);
        if (ret) fares.push(trip(airport, out, ret, out.price + ret.price, out.cur));
      }
  }

  const byDay = new Map();
  const byAirport = new Map();
  for (const fare of fares) {
    if (fare.price > max) continue;
    if (!byDay.has(fare.day) || fare.price < byDay.get(fare.day).price) byDay.set(fare.day, fare);
    if (!byAirport.has(fare.code) || fare.price < byAirport.get(fare.code).price) byAirport.set(fare.code, fare);
  }
  const days = [...byDay.values()].sort((first, second) => first.price - second.price);

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
    airports: [...byAirport.values()].sort((first, second) => first.price - second.price),
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
  if (res.every((result) => !result)) throw new AppError("noPrices");

  // Per airport: cheapest outbound and return flight each day (may mix airlines)
  const per = new Map();
  for (const fare of res.filter(Boolean).flat()) {
    if (!per.has(fare.code)) per.set(fare.code, { city: fare.city, out: new Map(), ret: new Map() });
    const cheapestByDay = per.get(fare.code)[fare.dir];
    if (!cheapestByDay.has(fare.day) || fare.price < cheapestByDay.get(fare.day).price) cheapestByDay.set(fare.day, fare);
  }

  // Best outbound + return combination for each pair of dates
  const combos = new Map();
  for (const [code, airport] of per)
    for (const [outDay, of] of airport.out)
      for (const [retDay, rf] of airport.ret) {
        if (retDay <= outDay) continue;
        const total = of.price + rf.price;
        const key = `${outDay}|${retDay}`;
        if (!combos.has(key) || total < combos.get(key).total)
          combos.set(key, { o: outDay, r: retDay, total, code, city: airport.city, out: of, ret: rf });
      }

  const sorted = [...combos.values()].sort((first, second) => first.total - second.total);
  const base = combos.get(`${ida}|${vuelta}`) || null;

  // Alternatives: the ones that save money first; if none, the cheapest ones
  const others = sorted.filter((combo) => combo !== base);
  const cheaper = base ? others.filter((combo) => combo.total < base.total - 0.5) : others;
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
