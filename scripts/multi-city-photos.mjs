// Gives every multi-city route (src/data/multiCity/*.json, docs/multi-city.md) its photo, kept in its file as
// `photo`: { src, width, height, page, author, license, town }, so its card shows it with no request at all. Chosen
// once from Wikimedia Commons through our own API (/api/photos/place: the town's own view), for the town you stay
// longest in (the one you land in last: several routes land in the same city), never one already given to another
// route, nor one without its author and licence, nor a panorama. A route that has a photo keeps it: set one by hand
// (any Commons file, with its author and licence) and it stays. Read the diff: a photo can be a poor view of the town.
//
//   pnpm dev
//   node scripts/multi-city-photos.mjs [--base=http://localhost:3001] [--only=albania,dalmacia] [--redo] (all again)
import fs from "node:fs";

const FOLDER = new URL("../src/data/multiCity/", import.meta.url);

// --name=value, or --name alone for true
const args = Object.fromEntries(
  process.argv.slice(2).map((arg) => {
    const [name, value = true] = arg.replace(/^--/, "").split("=");
    return [name, value];
  })
);
const BASE = args.base || "http://localhost:3001";
const ONLY = args.only ? new Set(args.only.split(",")) : null;
const wait = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));
// A card's photo is about 16:9 on phones and taller on wide screens: a panorama (Tirana's square, 800×168) is cut
// to nothing. Height over width at least this.
const MIN_PROPORTION = 0.5;

// A photo a card can show and credit: a photo (not a map or a drawing: .svg), its author and licence known (CC licences
// ask for both), not a panorama
const usable = (photo) =>
  photo?.src && /\.(jpe?g|png|webp)$/i.test(decodeURIComponent(photo.page)) && photo.author && photo.license && photo.height / photo.width >= MIN_PROPORTION;

// The towns to picture a route with, best first: its fullest version's towns by nights, the one you land in last,
// each once
const candidatesOf = (route) => {
  const { stops } = route.versions.full ?? route.versions.long ?? route.versions.short;
  const [landing, ...rest] = stops;
  const byStay = rest.map((stop, index) => ({ stop, index })).sort((first, second) => second.stop.nights.ideal - first.stop.nights.ideal || first.index - second.index);
  const towns = [...byStay.map(({ stop }) => stop), landing];
  return towns.filter((town, index) => towns.findIndex((other) => other.city.es === town.city.es) === index);
};

const photoOf = async (town) => {
  const params = new URLSearchParams({ city: town.city.es, lat: town.lat, lng: town.lng, lang: "es" });
  const response = await fetch(`${BASE}/api/photos/place?${params}`);
  if (!response.ok) throw new Error(`${town.city.es}: ${response.status} from ${BASE} (is the server running?)`);
  return response.json();
};

const files = fs.readdirSync(FOLDER).filter((name) => name.endsWith(".json")).sort();
const regions = files.map((name) => ({ name, routes: JSON.parse(fs.readFileSync(new URL(name, FOLDER), "utf8")) }));
const asked = (id) => !ONLY || ONLY.has(id);

// The photos kept (by hand or before) are never given to another route
const used = new Set(
  regions.flatMap(({ routes }) => Object.entries(routes).filter(([id, route]) => route.photo && !(args.redo && asked(id))).map(([, route]) => route.photo.page))
);

let given = 0;
const missing = [];
for (const { name, routes } of regions) {
  for (const [id, route] of Object.entries(routes)) {
    if (!asked(id) || (route.photo && !args.redo)) continue;
    delete route.photo;
    for (const town of candidatesOf(route)) {
      const photo = await photoOf(town);
      await wait(300);
      if (!usable(photo) || used.has(photo.page)) continue;
      route.photo = { src: photo.src, width: photo.width, height: photo.height, page: photo.page, author: photo.author, license: photo.license, town: town.city.es };
      used.add(photo.page);
      given++;
      console.log(`${id}: ${town.city.es}`);
      break;
    }
    if (!route.photo) missing.push(id);
  }
  fs.writeFileSync(new URL(name, FOLDER), `${JSON.stringify(routes, null, 2)}\n`);
}
console.log(`\n${given} photos given${missing.length ? `; none found for ${missing.join(", ")} (their cards show their landing city's)` : ""}`);
