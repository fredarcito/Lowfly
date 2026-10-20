// Trips through a hub to airports with no direct flight, or a cheaper one, on separate tickets (docs/stopovers.md):
// a same-day connection ("connection") or a few nights in the hub to visit it ("escapada"). The hubs come from the
// route graph; only their legs' prices are asked to the airlines. Only called from the server.
import * as more from "@/server/travelpayouts";
import { getAirports } from "@/server/airports";
import { getGraph } from "@/server/routeGraph";
import { legOf, routeFares } from "@/server/dailyPrices";
import { chooseHubs } from "@/server/stopovers/hubs";
import { combineLegs } from "@/server/stopovers/combine";
import { connects, estimatedArrival, isGetaway, landingDay, stayMinutes } from "@/server/stopovers/connection";
import { nightsBetween, shift, tomorrow } from "@/utils/dates";

// Nights in the hub for each kind of stopover: a connection the same day or a long stop with a night (under a day
// there), or a getaway of a whole day or more (MIN_GETAWAY_MINUTES)
export const HUB_NIGHTS = { connection: { min: 0, max: 1 }, escapada: { min: 1, max: 3 } };
// On the way back through the hub: the same day or one night
const RETURN_HUB_NIGHTS = { min: 0, max: 1 };

const cityKey = (airport) => (airport ? `${airport.city}|${airport.countryCode}` : null);

// Trips from `origin` to the airports `destinations` (codes) through a hub, leaving between `from` and `to`; with
// `stay` ({ min, max } nights at the destination) a return trip, all of it within `from` to `to`.
// { trips: [{ kind, price, day, code, city, country, via: { city, country, nights, minutes? }, nights?, legs, stops }],
//   hubs: [{ city, country }], failed: [airlines] }: the cheapest trip of each kind for each departure day.
// `outTo` / `backFrom` (flexible dates): leaving no later than, and flying home no earlier than, those days.
export const stopoverTrips = async ({ origin, destinations, from, to, stay = null, outTo = null, backFrom = null, lang = "es" }) => {
  const failed = new Set();
  const [graph, { airports }, moreRoutes] = await Promise.all([
    getGraph(),
    getAirports(lang),
    more.destinations(origin, tomorrow(), lang).catch(() => []),
  ]);
  if (!graph) return { trips: [], hubs: [], failed: [] };
  const airportsByCode = new Map(airports.map((airport) => [airport.code, airport]));
  const hubs = chooseHubs(origin, destinations, graph, airportsByCode);
  if (!hubs.length) return { trips: [], hubs: [], failed: [] };

  // The more airlines (seen in recent searches) only on the first leg, the one we know they fly
  const moreAirlines = (code) => moreRoutes.filter((route) => route.code === code).map((route) => route.airline);
  const lastHubDay = stay ? shift(to, -stay.min) : shift(to, HUB_NIGHTS.escapada.max);
  const lastOut = stay ? shift(to, -stay.min) : to;
  const firstOutTo = outTo && outTo < lastOut ? outTo : lastOut;
  const outFirst = hubs.flatMap((hub) =>
    hub.arrivals.map((arrival) => ({ dep: origin, arr: arrival.code, airlines: [...arrival.airlines, ...moreAirlines(arrival.code)], from, to: firstOutTo }))
  );
  const outSecond = hubs.flatMap((hub) =>
    hub.departures.flatMap((departure) => departure.to.map((destination) => ({ dep: departure.code, arr: destination.code, airlines: destination.airlines, from, to: lastHubDay })))
  );

  // The way back: straight home where there is a flight, otherwise through the same hub
  const backStraight = [];
  const backFirst = [];
  const backSecond = [];
  if (stay) {
    // The first day a flight back can be: after the shortest stay, and on a way back through a hub a night before
    // `backFrom` at most
    const earliest = shift(from, stay.min);
    const fromHome = backFrom && shift(backFrom, -RETURN_HUB_NIGHTS.max) > earliest ? shift(backFrom, -RETURN_HUB_NIGHTS.max) : earliest;
    for (const code of destinations) {
      if (graph[code]?.[origin]) backStraight.push({ dep: code, arr: origin, airlines: graph[code][origin], from: fromHome, to });
      else
        for (const hub of hubs) {
          const hubCity = `${hub.city}|${hub.countryCode}`;
          for (const [hubCode, airlines] of Object.entries(graph[code] ?? {}))
            if (cityKey(airportsByCode.get(hubCode)) === hubCity && graph[hubCode]?.[origin]) {
              backFirst.push({ dep: code, arr: hubCode, airlines, from: fromHome, to });
              backSecond.push({ dep: hubCode, arr: origin, airlines: graph[hubCode][origin], from: fromHome, to });
            }
        }
    }
  }

  const fares = await routeFares([...outFirst, ...outSecond, ...backStraight, ...backFirst, ...backSecond], failed);

  // Same day: a connection at the same airport with time enough; after a night or more: the same city. At the hub on
  // the way there (stop 0) the kind decides too: a getaway stays a whole day, a long stop less.
  const sameCity = (previous, next) => cityKey(airportsByCode.get(previous.to)) === cityKey(airportsByCode.get(next.from));
  const canFollowAs = (kind) => (previous, next, nights, stop) => {
    if (nights === 0) return connects(previous, next, airportsByCode);
    if (!sameCity(previous, next)) return false;
    if (stop !== 0) return true;
    return isGetaway(previous, next, nights, airportsByCode) === (kind === "escapada");
  };

  // The flight home no earlier than `backFrom`; on a way back through a hub, its first flight a night before at most
  const homeFrom = backFrom ?? from;
  const legs = {
    outFirst: legOf(fares, outFirst, from, firstOutTo),
    outSecond: legOf(fares, outSecond, from, lastHubDay),
    backStraight: legOf(fares, backStraight, homeFrom, to),
    backFirst: legOf(fares, backFirst, backFrom ? shift(backFrom, -RETURN_HUB_NIGHTS.max) : from, to),
    backSecond: legOf(fares, backSecond, homeFrom, to),
  };
  const found = [];
  for (const [kind, hubNights] of Object.entries(HUB_NIGHTS)) {
    const canFollow = canFollowAs(kind);
    if (!stay) {
      found.push(...combineLegs([legs.outFirst, legs.outSecond], [hubNights], canFollow).map((trip) => ({ ...trip, kind })));
      continue;
    }
    if (legs.backStraight.length)
      found.push(...combineLegs([legs.outFirst, legs.outSecond, legs.backStraight], [hubNights, stay], canFollow).map((trip) => ({ ...trip, kind })));
    if (legs.backFirst.length)
      found.push(
        ...combineLegs([legs.outFirst, legs.outSecond, legs.backFirst, legs.backSecond], [hubNights, stay, RETURN_HUB_NIGHTS], canFollow).map((trip) => ({ ...trip, kind }))
      );
  }

  // The cheapest of each kind per departure day
  const best = new Map();
  for (const trip of found) {
    const key = `${trip.kind}|${trip.legs[0].day}`;
    if (!best.has(key) || trip.price < best.get(key).price) best.set(key, trip);
  }
  const trips = [...best.values()].map((trip) => describe(trip, airportsByCode)).sort((first, second) => first.price - second.price);
  return { trips, hubs: hubs.map((hub) => ({ city: hub.city, country: hub.country })), failed: [...failed] };
};

// A trip as the results show it: where it goes, through which city, how long there. The nights shown count from the
// day you land (a 22:00 flight landing at 00:25 spends one night fewer there), at least one when the flights were
// joined with a night.
const describe = ({ kind, price, legs }, airportsByCode) => {
  const nightsShown = (previous, next) => {
    const nights = nightsBetween(previous.day, next.day);
    return nights === 0 ? 0 : Math.max(1, nightsBetween(landingDay(previous, airportsByCode), next.day));
  };
  const [first, second] = legs;
  const hub = airportsByCode.get(first.to);
  const destination = airportsByCode.get(second.to);
  const back = legs[2];
  return {
    kind,
    price,
    cur: "EUR",
    day: first.day,
    code: destination.code,
    city: destination.city,
    country: destination.country,
    via: {
      city: hub.city,
      country: hub.country,
      nights: nightsShown(first, second),
      minutes: stayMinutes(first, second, airportsByCode),
    },
    ...(back && { nights: nightsShown(second, back) }),
    // A flight with no arrival time (Wizz) carries an estimated one, to show as such; one landing after midnight, the
    // day it lands (`arriveDay`)
    legs: legs.map((leg) => {
      const estimate = !leg.arrive && estimatedArrival(leg, airportsByCode.get(leg.from), airportsByCode.get(leg.to));
      const arriveDay = landingDay(leg, airportsByCode);
      return { ...leg, ...(estimate && { arriveEstimate: estimate }), ...(arriveDay !== leg.day && { arriveDay }) };
    }),
    // Between each flight and the next: where, how many nights, how long (null: unknown) and what it is: a
    // "connection" the same day, a "layover" (a night, under a day there) or a "stay" (a whole day or more: a getaway,
    // the destination)
    stops: legs.slice(1).map((next, index) => {
      const previous = legs[index];
      const airport = airportsByCode.get(previous.to);
      const nights = nightsBetween(previous.day, next.day);
      const type = nights === 0 ? "connection" : isGetaway(previous, next, nights, airportsByCode) || previous.to === destination.code ? "stay" : "layover";
      return { code: previous.to, city: airport?.city ?? previous.to, nights: nightsShown(previous, next), minutes: stayMinutes(previous, next, airportsByCode), type };
    }),
  };
};

// Trips through a hub to a country, or one of its cities (`city` null: the whole country), named as the airport
// list names them: like stopoverTrips, with the destination airports found by name
export const stopoversTo = async ({ origin, country, city, from, to, stay = null, outTo = null, backFrom = null, lang = "es" }) => {
  const { airports } = await getAirports(lang);
  const destinations = airports
    .filter((airport) => airport.country === country && (!city || airport.city === city) && airport.code !== origin)
    .map((airport) => airport.code);
  return { origin, country, city, ...(await stopoverTrips({ origin, destinations, from, to, stay, outTo, backFrom, lang })) };
};
