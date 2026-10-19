// The hub cities for a stopover, from the route graph alone (no requests): cities with a flight from the origin and a
// flight on to one of the destination airports. Their prices are asked later, so only the few most direct are kept.
import { distanceKm } from "@/utils/geo";

// Most hub cities asked in one search (each one is a few requests to the airlines)
export const MAX_HUBS = 3;
// A hub making the way this many times longer than flying straight is left out
const MAX_DETOUR = 1.8;

const cityKey = (airport) => `${airport.city}|${airport.countryCode}`;

// The airports reachable from `origin` with one stop and no direct flight, through a hub that is not too far out of
// the way (the destination picker offers them): [codes]
export const oneStopDestinations = (origin, graph, airportsByCode) => {
  const home = airportsByCode.get(origin);
  const direct = graph[origin] ?? {};
  const reached = new Set();
  for (const hub of Object.keys(direct)) {
    const hubAirport = airportsByCode.get(hub);
    const first = distanceKm(home, hubAirport);
    if (first == null) continue;
    for (const code of Object.keys(graph[hub] ?? {})) {
      if (code === origin || direct[code] || reached.has(code)) continue;
      const destination = airportsByCode.get(code);
      const straight = distanceKm(home, destination);
      const second = distanceKm(hubAirport, destination);
      if (straight && second != null && (first + second) / straight <= MAX_DETOUR) reached.add(code);
    }
  }
  return [...reached];
};

// origin: airport code; destinations: the destination airports' codes; graph: { from: { to: [airlines] } };
// airportsByCode: Map code → airport (server/airports). The best hub cities first:
// [{ city, country, countryCode, arrivals: [{ code, airlines }], departures: [{ code, to: [{ code, airlines }] }], detour }]
// (arrivals: its airports reached from the origin; departures: its airports with a flight to a destination)
export const chooseHubs = (origin, destinations, graph, airportsByCode) => {
  const home = airportsByCode.get(origin);
  const targets = new Set(destinations);
  const byCity = new Map();
  const hubOf = (airport) => {
    const key = cityKey(airport);
    if (!byCity.has(key))
      byCity.set(key, { city: airport.city, country: airport.country, countryCode: airport.countryCode, arrivals: [], departures: [] });
    return byCity.get(key);
  };

  for (const [code, airlines] of Object.entries(graph[origin] ?? {})) {
    const airport = airportsByCode.get(code);
    if (airport && !targets.has(code)) hubOf(airport).arrivals.push({ code, airlines });
  }
  // Airports of those cities (not only the ones reached: Rome's Ciampino after landing at Fiumicino) with a flight on
  const hubCities = new Set(byCity.keys());
  for (const [code, onward] of Object.entries(graph)) {
    const airport = airportsByCode.get(code);
    if (!airport || code === origin || targets.has(code) || !hubCities.has(cityKey(airport))) continue;
    const to = Object.entries(onward)
      .filter(([destination]) => targets.has(destination))
      .map(([destination, airlines]) => ({ code: destination, airlines }));
    if (to.length) hubOf(airport).departures.push({ code, to });
  }

  // How much longer than flying straight: the most direct arrival, departure and destination of the city
  const detourOf = (hub) => {
    let best = Infinity;
    for (const arrival of hub.arrivals)
      for (const departure of hub.departures)
        for (const destination of departure.to) {
          const straight = distanceKm(home, airportsByCode.get(destination.code));
          const first = distanceKm(home, airportsByCode.get(arrival.code));
          const second = distanceKm(airportsByCode.get(departure.code), airportsByCode.get(destination.code));
          if (straight && first != null && second != null) best = Math.min(best, (first + second) / straight);
        }
    return best;
  };
  const airlineCount = (hub) => new Set([...hub.arrivals, ...hub.departures.flatMap((departure) => departure.to)].flatMap((route) => route.airlines)).size;

  const hubs = [...byCity.values()]
    .filter((hub) => hub.arrivals.length && hub.departures.length && hub.city !== home?.city)
    .map((hub) => ({ ...hub, detour: detourOf(hub) }))
    .filter((hub) => hub.detour <= MAX_DETOUR)
    .sort((first, second) => first.detour - second.detour || airlineCount(second) - airlineCount(first));
  return hubs.slice(0, MAX_HUBS);
};
