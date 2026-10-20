// Checks the multi-city routes (src/data/multiCity/*.json, docs/multi-city.md) against the real airports and the route
// graph, and prints per route what is wrong (errors) and what a person should look at (warnings). Run it after
// adding or editing routes; it changes nothing.
//
//   pnpm dev
//   node --env-file=.env.local scripts/check-multi-city.mjs [--base=http://localhost:3001] [--only=italia-clasica,dalmacia]
//     [--quiet] (only routes with something to say)
import fs from "node:fs";

const FOLDER = new URL("../src/data/multiCity/", import.meta.url);
const GUIDES_FILE = new URL("../src/data/cityGuides.json", import.meta.url);
const ORIGINS_FILE = new URL("../src/server/flightRoutes/routes.js", import.meta.url);

// --name=value, or --name alone for true
const args = Object.fromEntries(
  process.argv.slice(2).map((arg) => {
    const [name, value = true] = arg.replace(/^--/, "").split("=");
    return [name, value];
  })
);
const BASE = args.base || "http://localhost:3001";
const ONLY = args.only ? new Set(args.only.split(",")) : null;

const KINDS = ["classic", "surprise"];
const VERSIONS = ["short", "full", "long"];
// The sum of `nights.ideal` per version
const NIGHTS = { short: { min: 4, max: 5 }, full: { min: 7, max: 9 }, long: { min: 11, max: 13 } };
const LAND_BY = ["train", "bus", "ferry", "car"];
// Fastest believable average speed per way of travelling, straight-line km per hour (high-speed trains: Sevilla →
// Córdoba in 45 min is 160 km/h)
const FASTEST_KMH = { train: 230, bus: 85, car: 95, ferry: 45 };
// Slower than this, with more than SLOW_FROM_MINUTES, is worth a look (a detour, or a typo)
const SLOWEST_KMH = 12;
const SLOW_FROM_MINUTES = 150;
// An airport further than this from its stop is suspicious
const AIRPORT_MAX_KM = 120;

const EARTH_RADIUS_KM = 6371;
const radians = (degrees) => (degrees * Math.PI) / 180;
const distanceKm = (first, second) => {
  const latitudeDelta = radians(second.lat - first.lat);
  const longitudeDelta = radians(second.lon - first.lon);
  const along =
    Math.sin(latitudeDelta / 2) ** 2 + Math.cos(radians(first.lat)) * Math.cos(radians(second.lat)) * Math.sin(longitudeDelta / 2) ** 2;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(along));
};
const pointOf = (stop) => ({ lat: stop.lat, lon: stop.lng });

const readAirports = async () => {
  const response = await fetch(`${BASE}/api/airports?lang=es`);
  if (!response.ok) throw new Error(`Airports: ${response.status} from ${BASE} (is the server running?)`);
  const { airports } = await response.json();
  return new Map(airports.map((airport) => [airport.code, airport]));
};

const readGraph = async () => {
  const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/route_graph?id=eq.1&select=routes`;
  const key = process.env.SUPABASE_SECRET_KEY;
  const response = await fetch(url, { headers: { apikey: key, authorization: `Bearer ${key}` } });
  if (!response.ok) throw new Error(`Route graph: ${response.status}`);
  const [row] = await response.json();
  if (!row) throw new Error("Route graph: empty (has the cron run?)");
  return row.routes;
};

// ROUTE_ORIGINS, read from its file (this script runs outside Next, without the @/ imports)
const readOrigins = () => {
  const source = fs.readFileSync(ORIGINS_FILE, "utf8");
  const list = source.match(/ROUTE_ORIGINS = \[([\s\S]*?)\];/)?.[1] ?? "";
  return [...list.matchAll(/"([A-Z]{3})"/g)].map((match) => match[1]);
};

const readRoutes = () =>
  fs
    .readdirSync(FOLDER)
    .filter((name) => name.endsWith(".json"))
    .sort()
    .map((name) => ({ name, routes: JSON.parse(fs.readFileSync(new URL(name, FOLDER), "utf8")) }));

const hasBothLanguages = (text) => typeof text?.es === "string" && text.es.trim() && typeof text?.en === "string" && text.en.trim();

const checkRoute = (route, { airportsByCode, graph, guides, origins }) => {
  const errors = [];
  const warnings = [];

  if (!KINDS.includes(route.kind)) errors.push(`kind "${route.kind}"`);
  if (typeof route.reviewed !== "boolean") errors.push("reviewed is not true / false");
  if (!hasBothLanguages(route.name)) errors.push("name in es and en");
  if (!hasBothLanguages(route.summary)) errors.push("summary in es and en");
  if (route.note && !hasBothLanguages(route.note)) errors.push("note in es and en");
  if (!Array.isArray(route.countries) || !route.countries.length) errors.push("countries");
  if (typeof route.reversible !== "boolean") errors.push("reversible is not true / false");
  if (!Array.isArray(route.months) || route.months.some((month) => !Number.isInteger(month) || month < 1 || month > 12)) errors.push("months");
  if (route.season) {
    const { from, to } = route.season;
    const isDay = (day) => /^(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/.test(day ?? "");
    if (!isDay(from) || !isDay(to)) errors.push(`season ${from} / ${to} (MM-DD)`);
    if (!hasBothLanguages(route.season.name)) errors.push("season name in es and en");
  }

  const versions = Object.keys(route.versions ?? {});
  if (!versions.length) errors.push("no versions");
  for (const version of versions) if (!VERSIONS.includes(version)) errors.push(`unknown version "${version}"`);

  // Every airport code once, so a wrong one is said once per route
  const checkedCodes = new Set();
  const checkAirport = (code, stop, where) => {
    if (checkedCodes.has(code)) return;
    checkedCodes.add(code);
    const airport = airportsByCode.get(code);
    if (!airport) return warnings.push(`${where}: ${code} is not a Ryanair / Wizz airport`);
    const away = distanceKm(pointOf(stop), airport);
    if (away > AIRPORT_MAX_KM) warnings.push(`${where}: ${code} (${airport.city}) is ${Math.round(away)} km away`);
    if (!graph[code]) warnings.push(`${where}: ${code} has no routes in the graph`);
  };

  let previousNights = 0;
  // Per version and direction, the airports to fly into and home from
  const ends = [];
  for (const version of VERSIONS.filter((name) => versions.includes(name))) {
    const stops = route.versions[version]?.stops;
    if (!Array.isArray(stops) || stops.length < 2) {
      if (!(version === "short" && stops?.length === 1)) errors.push(`${version}: fewer than 2 stops`);
      if (!stops?.length) continue;
    }
    let idealNights = 0;
    stops.forEach((stop, index) => {
      const where = `${version} · ${stop.city?.es ?? `stop ${index + 1}`}`;
      const last = index === stops.length - 1;
      if (!hasBothLanguages(stop.city)) errors.push(`${where}: city in es and en`);
      if (typeof stop.lat !== "number" || typeof stop.lng !== "number") errors.push(`${where}: lat / lng`);
      if (!/^[A-Z]{2}$/.test(stop.countryCode ?? "")) errors.push(`${where}: countryCode`);
      if (!Array.isArray(stop.codes)) errors.push(`${where}: codes is not a list`);
      const { min, ideal } = stop.nights ?? {};
      if (!Number.isInteger(min) || !Number.isInteger(ideal) || min < 0 || min > ideal) errors.push(`${where}: nights ${min} / ${ideal}`);
      else idealNights += ideal;
      if (stop.guide && !guides[stop.guide]) errors.push(`${where}: guide "${stop.guide}" does not exist`);
      if ((index === 0 || last) && !stop.codes?.length) errors.push(`${where}: first and last stops need an airport`);
      for (const code of stop.codes ?? []) checkAirport(code, stop, where);

      if (last) {
        if (stop.land) errors.push(`${where}: land on the last stop`);
        return;
      }
      if (!stop.land) return errors.push(`${where}: no land to the next stop`);
      if (!LAND_BY.includes(stop.land.by)) errors.push(`${where}: land by "${stop.land.by}"`);
      if (!Number.isInteger(stop.land.minutes) || stop.land.minutes <= 0) return errors.push(`${where}: land minutes`);
      const next = stops[index + 1];
      if (typeof next.lat !== "number" || typeof stop.lat !== "number") return;
      const km = distanceKm(pointOf(stop), pointOf(next));
      const speed = km / (stop.land.minutes / 60);
      const leg = `${where} → ${next.city?.es}: ${stop.land.minutes} min ${stop.land.by} for ${Math.round(km)} km`;
      if (speed > (FASTEST_KMH[stop.land.by] ?? 130)) warnings.push(`${leg} (too fast)`);
      else if (speed < SLOWEST_KMH && stop.land.minutes > SLOW_FROM_MINUTES) warnings.push(`${leg} (slow)`);
    });

    const range = NIGHTS[version];
    if (range && (idealNights < range.min || idealNights > range.max))
      warnings.push(`${version}: ${idealNights} ideal nights (expected ${range.min}–${range.max})`);
    if (idealNights <= previousNights) warnings.push(`${version}: not longer than the shorter version`);
    previousNights = idealNights;

    const entry = stops[0].codes ?? [];
    const exit = stops.at(-1).codes ?? [];
    ends.push({ version, entry, exit });
    if (route.reversible) ends.push({ version, entry: exit, exit: entry });
  }

  // The origins (ROUTE_ORIGINS) with a flight to the entry and one home from the exit, of any version
  const flies = (from, to) => Boolean(graph[from]?.[to]);
  const reachedFrom = origins.filter((origin) =>
    ends.some(({ entry, exit }) => entry.some((code) => flies(origin, code)) && exit.some((code) => flies(code, origin)))
  );
  // Over every airport of the graph, not only ours: is anyone able to do it?
  const anyOrigin = Object.keys(graph).filter((origin) =>
    ends.some(({ entry, exit }) => entry.some((code) => flies(origin, code)) && exit.some((code) => flies(code, origin)))
  ).length;
  // Not wrong, but never offered while Ryanair and Wizz do not fly there (the graph has only them)
  if (!anyOrigin) warnings.push("not offered: no Ryanair / Wizz flight to its entry and home from its exit");

  return { errors, warnings, versions, reachedFrom, anyOrigin };
};

const main = async () => {
  const [airportsByCode, graph] = await Promise.all([readAirports(), readGraph()]);
  const guides = JSON.parse(fs.readFileSync(GUIDES_FILE, "utf8"));
  const origins = readOrigins();
  const context = { airportsByCode, graph, guides, origins };

  const seen = new Map();
  const totals = { routes: 0, versions: 0, reviewed: 0, errors: 0, warnings: 0, unflown: 0, classic: 0, surprise: 0 };
  for (const { name, routes } of readRoutes()) {
    console.log(`\n${name}`);
    for (const [id, route] of Object.entries(routes)) {
      if (ONLY && !ONLY.has(id)) continue;
      const { errors, warnings, versions, reachedFrom, anyOrigin } = checkRoute(route, context);
      if (seen.has(id)) errors.push(`id also in ${seen.get(id)}`);
      seen.set(id, name);
      totals.routes++;
      totals.versions += versions.length;
      totals.reviewed += route.reviewed ? 1 : 0;
      totals[route.kind] = (totals[route.kind] ?? 0) + 1;
      totals.errors += errors.length;
      totals.warnings += warnings.length;
      totals.unflown += anyOrigin ? 0 : 1;
      if (args.quiet && !errors.length && !warnings.length) continue;
      const mark = errors.length ? "✗" : warnings.length ? "!" : "✓";
      console.log(
        `  ${mark} ${id} (${route.kind}, ${versions.join(" + ")}${route.reviewed ? ", reviewed" : ""}) · from ${reachedFrom.length}/${origins.length} of our origins, ${anyOrigin} airports in all`
      );
      for (const error of errors) console.log(`      error: ${error}`);
      for (const warning of warnings) console.log(`      look: ${warning}`);
    }
  }
  console.log(
    `\n${totals.routes} routes (${totals.classic} classic, ${totals.surprise} surprise), ${totals.versions} versions, ${totals.reviewed} reviewed · ${totals.errors} errors, ${totals.warnings} warnings, ${totals.unflown} not offered`
  );
  if (totals.errors) process.exitCode = 1;
};

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
