// Writes src/data/cityGuides.json: the city guides' itineraries (/es/guides/rome-3-days), in Spanish and English,
// made once by the AI through our API (/api/city-guides: the same planner as the app's, for any visitor, with no
// dates) and then only read by the pages. Read the diff before publishing: search engines read every word.
// Run it once, and again when a guide is added below: it only makes the missing ones.
//
//   pnpm dev   (or: npx next start -p 3002)
//   node --env-file=.env.local scripts/city-guides.mjs [--base=http://localhost:3001] [--only=rome-3-days] [--redo]
import fs from "node:fs";

const FILE = new URL("../src/data/cityGuides.json", import.meta.url);
const LANGS = ["es", "en"];
const RETRIES = 3;

// The guides: `codes`, the airports that fly there (a route's page to one of them links to the guide); `lat`,
// `lng`, the centre (only places near it are kept); `photo`, a Wikimedia Commons file for its card and header
// (otherwise the city's usual one, server/photos), with its author and licence read from Commons on every run
const GUIDES = [
  {
    slug: "rome-3-days",
    dayCount: 3,
    codes: ["FCO", "CIA"],
    city: { es: "Roma", en: "Rome" },
    country: { es: "Italia", en: "Italy" },
    lat: 41.8986,
    lng: 12.4768,
  },
  {
    slug: "lisbon-3-days",
    dayCount: 3,
    codes: ["LIS"],
    city: { es: "Lisboa", en: "Lisbon" },
    country: { es: "Portugal", en: "Portugal" },
    lat: 38.7139,
    lng: -9.1394,
  },
];

// --name=value, or --name alone for true
const args = Object.fromEntries(
  process.argv.slice(2).map((arg) => {
    const [name, value = true] = arg.replace(/^--/, "").split("=");
    return [name, value];
  })
);
const BASE = args.base || "http://localhost:3001";
const ONLY = args.only ? new Set(args.only.split(",")) : null;
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const UA = "Lowfly (https://lowfly.travel)";
// The photo's width: a card's at twice its size, and a guide's header
const PHOTO_WIDTH = 960;

const guides = fs.existsSync(FILE) ? JSON.parse(fs.readFileSync(FILE, "utf8")) : {};
const save = () => fs.writeFileSync(FILE, JSON.stringify(Object.fromEntries(Object.entries(guides).sort()), null, 1) + "\n");

// One language of a guide from our API, trying again when the AI is busy
const makeGuide = async (guide, lang) => {
  for (let attempt = 0; ; attempt++) {
    const response = await fetch(`${BASE}/api/city-guides`, {
      method: "POST",
      headers: { "content-type": "application/json", authorization: `Bearer ${process.env.CRON_SECRET}` },
      body: JSON.stringify({ city: guide.city[lang], country: guide.country[lang], lat: guide.lat, lng: guide.lng, dayCount: guide.dayCount, lang }),
    });
    if (response.ok) return response.json();
    if (response.status >= 500 && attempt < RETRIES) {
      console.warn(`  ${guide.slug} ${lang}: ${response.status}, trying again`);
      await wait(10_000 * 2 ** attempt);
      continue;
    }
    throw new Error(`${guide.slug} ${lang}: ${response.status} ${await response.text()}`);
  }
};

// A Commons file as the pages show a photo: { src, page, author, license } (its licence asks for the credit)
const commonsPhoto = async (file) => {
  const url = new URL("https://commons.wikimedia.org/w/api.php");
  Object.entries({ action: "query", format: "json", titles: file, prop: "imageinfo", iiprop: "url|extmetadata", iiurlwidth: PHOTO_WIDTH }).forEach(
    ([name, value]) => url.searchParams.set(name, value)
  );
  const data = await (await fetch(url, { headers: { "user-agent": UA } })).json();
  const info = Object.values(data.query.pages)[0]?.imageinfo?.[0];
  if (!info) throw new Error(`No such photo on Commons: ${file}`);
  const plain = (field) => info.extmetadata[field]?.value.replace(/<[^>]+>/g, "").trim() || null;
  return { src: info.thumburl.split("?")[0], page: info.descriptionurl, author: plain("Artist"), license: plain("LicenseShortName") };
};

if (!process.env.CRON_SECRET) throw new Error("CRON_SECRET is not set: run with --env-file=.env.local");

for (const guide of GUIDES) {
  if (ONLY && !ONLY.has(guide.slug)) continue;
  const { slug, photo: photoFile, ...about } = guide;
  // Its photo (no AI: read again every run, so a new choice above shows)
  const photo = photoFile ? await commonsPhoto(photoFile) : null;
  if (guides[slug] && !args.redo) {
    guides[slug] = { ...guides[slug], ...about, photo };
    save();
    continue;
  }
  console.log(`${slug}…`);
  const languages = {};
  for (const lang of LANGS) languages[lang] = await makeGuide(guide, lang);
  guides[slug] = { ...about, photo, ...languages };
  save();
  console.log(`  ${slug}: ${languages.es.itinerary.days.map((day) => day.title).join(" · ")}`);
}
