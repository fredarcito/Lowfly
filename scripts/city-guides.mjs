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
  {
    slug: "paris-3-days",
    slugs: { es: "paris-3-dias", en: "paris-3-days" },
    dayCount: 3,
    codes: ["BVA", "ORY", "CDG"],
    city: { es: "París", en: "Paris" },
    country: { es: "Francia", en: "France" },
    lat: 48.8566,
    lng: 2.3522,
  },
  {
    slug: "london-3-days",
    slugs: { es: "londres-3-dias", en: "london-3-days" },
    dayCount: 3,
    codes: ["STN", "LGW", "LTN", "LHR"],
    city: { es: "Londres", en: "London" },
    country: { es: "Reino Unido", en: "United Kingdom" },
    lat: 51.5074,
    lng: -0.1278,
  },
  {
    slug: "amsterdam-3-days",
    slugs: { es: "amsterdam-3-dias", en: "amsterdam-3-days" },
    dayCount: 3,
    codes: ["AMS"],
    city: { es: "Ámsterdam", en: "Amsterdam" },
    country: { es: "Países Bajos", en: "Netherlands" },
    lat: 52.3731,
    lng: 4.8922,
  },
  {
    slug: "berlin-3-days",
    slugs: { es: "berlin-3-dias", en: "berlin-3-days" },
    dayCount: 3,
    codes: ["BER"],
    city: { es: "Berlín", en: "Berlin" },
    country: { es: "Alemania", en: "Germany" },
    lat: 52.52,
    lng: 13.405,
  },
  {
    slug: "prague-3-days",
    slugs: { es: "praga-3-dias", en: "prague-3-days" },
    dayCount: 3,
    codes: ["PRG"],
    city: { es: "Praga", en: "Prague" },
    country: { es: "República Checa", en: "Czech Republic" },
    lat: 50.0875,
    lng: 14.4213,
  },
  {
    slug: "budapest-3-days",
    slugs: { es: "budapest-3-dias", en: "budapest-3-days" },
    dayCount: 3,
    codes: ["BUD"],
    city: { es: "Budapest", en: "Budapest" },
    country: { es: "Hungría", en: "Hungary" },
    lat: 47.4979,
    lng: 19.0402,
  },
  {
    slug: "vienna-3-days",
    slugs: { es: "viena-3-dias", en: "vienna-3-days" },
    dayCount: 3,
    codes: ["VIE"],
    city: { es: "Viena", en: "Vienna" },
    country: { es: "Austria", en: "Austria" },
    lat: 48.2082,
    lng: 16.3738,
  },
  {
    slug: "athens-3-days",
    slugs: { es: "atenas-3-dias", en: "athens-3-days" },
    dayCount: 3,
    codes: ["ATH"],
    city: { es: "Atenas", en: "Athens" },
    country: { es: "Grecia", en: "Greece" },
    lat: 37.9755,
    lng: 23.7348,
  },
  {
    slug: "marrakesh-3-days",
    slugs: { es: "marrakech-3-dias", en: "marrakesh-3-days" },
    dayCount: 3,
    codes: ["RAK"],
    city: { es: "Marrakech", en: "Marrakesh" },
    country: { es: "Marruecos", en: "Morocco" },
    lat: 31.6295,
    lng: -7.9811,
  },
  {
    slug: "porto-2-days",
    slugs: { es: "oporto-2-dias", en: "porto-2-days" },
    dayCount: 2,
    codes: ["OPO"],
    city: { es: "Oporto", en: "Porto" },
    country: { es: "Portugal", en: "Portugal" },
    lat: 41.1496,
    lng: -8.6109,
  },
  {
    slug: "brussels-2-days",
    slugs: { es: "bruselas-2-dias", en: "brussels-2-days" },
    dayCount: 2,
    codes: ["CRL", "BRU"],
    city: { es: "Bruselas", en: "Brussels" },
    country: { es: "Bélgica", en: "Belgium" },
    lat: 50.8467,
    lng: 4.3525,
  },
  {
    slug: "florence-2-days",
    slugs: { es: "florencia-2-dias", en: "florence-2-days" },
    dayCount: 2,
    codes: ["FLR", "PSA"],
    city: { es: "Florencia", en: "Florence" },
    country: { es: "Italia", en: "Italy" },
    lat: 43.7696,
    lng: 11.2558,
  },
  {
    slug: "venice-2-days",
    slugs: { es: "venecia-2-dias", en: "venice-2-days" },
    dayCount: 2,
    codes: ["VCE", "TSF"],
    city: { es: "Venecia", en: "Venice" },
    country: { es: "Italia", en: "Italy" },
    lat: 45.4371,
    lng: 12.3326,
  },
  {
    slug: "naples-2-days",
    slugs: { es: "napoles-2-dias", en: "naples-2-days" },
    dayCount: 2,
    codes: ["NAP"],
    city: { es: "Nápoles", en: "Naples" },
    country: { es: "Italia", en: "Italy" },
    lat: 40.8518,
    lng: 14.2681,
  },
  {
    slug: "milan-2-days",
    slugs: { es: "milan-2-dias", en: "milan-2-days" },
    dayCount: 2,
    codes: ["BGY", "MXP", "LIN"],
    city: { es: "Milán", en: "Milan" },
    country: { es: "Italia", en: "Italy" },
    lat: 45.4642,
    lng: 9.19,
  },
  {
    slug: "krakow-2-days",
    slugs: { es: "cracovia-2-dias", en: "krakow-2-days" },
    dayCount: 2,
    codes: ["KRK"],
    city: { es: "Cracovia", en: "Krakow" },
    country: { es: "Polonia", en: "Poland" },
    lat: 50.0614,
    lng: 19.9366,
  },
  {
    slug: "dublin-2-days",
    slugs: { es: "dublin-2-dias", en: "dublin-2-days" },
    dayCount: 2,
    codes: ["DUB"],
    city: { es: "Dublín", en: "Dublin" },
    country: { es: "Irlanda", en: "Ireland" },
    lat: 53.3498,
    lng: -6.2603,
  },
  {
    slug: "edinburgh-2-days",
    slugs: { es: "edimburgo-2-dias", en: "edinburgh-2-days" },
    dayCount: 2,
    codes: ["EDI"],
    city: { es: "Edimburgo", en: "Edinburgh" },
    country: { es: "Reino Unido", en: "United Kingdom" },
    lat: 55.9533,
    lng: -3.1883,
  },
  {
    slug: "copenhagen-2-days",
    slugs: { es: "copenhague-2-dias", en: "copenhagen-2-days" },
    dayCount: 2,
    codes: ["CPH"],
    city: { es: "Copenhague", en: "Copenhagen" },
    country: { es: "Dinamarca", en: "Denmark" },
    lat: 55.6761,
    lng: 12.5683,
  },
  {
    slug: "bologna-1-day",
    slugs: { es: "bolonia-1-dia", en: "bologna-1-day" },
    dayCount: 1,
    codes: ["BLQ"],
    city: { es: "Bolonia", en: "Bologna" },
    country: { es: "Italia", en: "Italy" },
    lat: 44.4949,
    lng: 11.3426,
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
