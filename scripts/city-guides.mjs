// Writes src/data/cityGuides.json: the city guides' itineraries (/es/guias/roma-3-dias), made once by the AI
// through our API (/api/city-guides: the same planner as the app's, for any visitor, with no dates) and then only
// read by the pages. Made in Spanish and translated into English: the same guide in both, its places, times and
// order (a reader switching languages finds the same days). Read the diff before publishing: search engines read
// every word.
// Run it once, and again when a guide is added below: it only makes the missing ones.
//
//   pnpm dev   (or: npx next start -p 3002)
//   node --env-file=.env.local scripts/city-guides.mjs [--base=http://localhost:3001] [--only=rome-3-days]
//     [--redo] (all again) [--translate] (the translations again)
import fs from "node:fs";

const FILE = new URL("../src/data/cityGuides.json", import.meta.url);
// The language a guide is made in, and the ones it is translated into
const FIRST_LANG = "es";
const TRANSLATIONS = ["en"];
const RETRIES = 3;

// The guides, by their id (the file's key): `slugs`, their names in the address in each language (/es/guias/roma-3-dias);
// `codes`, the airports that fly there (a route's page to one of them links to the guide); `lat`,
// `lng`, the centre (only places near it are kept); `photo`, a Wikimedia Commons file for its card and header
// (otherwise the city's usual one, server/photos), with its author and licence read from Commons on every run
const GUIDES = [
  {
    slug: "rome-3-days",
    slugs: { es: "roma-3-dias", en: "rome-3-days" },
    dayCount: 3,
    codes: ["FCO", "CIA"],
    city: { es: "Roma", en: "Rome" },
    country: { es: "Italia", en: "Italy" },
    lat: 41.8986,
    lng: 12.4768,
  },
  {
    slug: "lisbon-3-days",
    slugs: { es: "lisboa-3-dias", en: "lisbon-3-days" },
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

// Asks our API (/api/city-guides), trying again when the AI is busy
const askApi = async (label, body) => {
  for (let attempt = 0; ; attempt++) {
    const response = await fetch(`${BASE}/api/city-guides`, {
      method: "POST",
      headers: { "content-type": "application/json", authorization: `Bearer ${process.env.CRON_SECRET}` },
      body: JSON.stringify(body),
    });
    if (response.ok) return response.json();
    if (response.status >= 500 && attempt < RETRIES) {
      console.warn(`  ${label}: ${response.status}, trying again`);
      await wait(10_000 * 2 ** attempt);
      continue;
    }
    throw new Error(`${label}: ${response.status} ${await response.text()}`);
  }
};

// A guide made in its first language: { intro, itinerary }
const makeGuide = (guide) =>
  askApi(`${guide.slug} ${FIRST_LANG}`, {
    city: guide.city[FIRST_LANG],
    country: guide.country[FIRST_LANG],
    lat: guide.lat,
    lng: guide.lng,
    dayCount: guide.dayCount,
    lang: FIRST_LANG,
  });

// The same guide in `lang`: its texts translated, its places, times and order kept
const translateGuide = (guide, made, lang) =>
  askApi(`${guide.slug} ${lang}`, { city: guide.city[lang], lang, translate: { intro: made.intro, itinerary: made.itinerary } });

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
  const made = !guides[slug] || args.redo;
  if (made) {
    console.log(`${slug}…`);
    guides[slug] = { ...about, [FIRST_LANG]: await makeGuide(guide) };
    console.log(`  ${slug}: ${guides[slug][FIRST_LANG].itinerary.days.map((day) => day.title).join(" · ")}`);
  }
  guides[slug] = { ...guides[slug], ...about, photo };
  const first = guides[slug][FIRST_LANG];
  // Its translations: with the guide, or again when asked
  for (const lang of TRANSLATIONS) {
    if (guides[slug][lang] && !made && !args.translate) continue;
    console.log(`  ${slug} ${lang}: translating…`);
    guides[slug][lang] = await translateGuide(guide, first, lang);
  }
  save();
}
