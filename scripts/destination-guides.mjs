// Writes src/data/destinationGuides.json: for every destination airport, a one-sentence "why go" and three
// highlights, in Spanish and English, written by Gemini from the city's Wikipedia summary and its Wikivoyage
// travel guide (what to see and eat), so it does not invent.
// Run it once, and again when the airlines open new destinations: it only does the missing ones.
//
//   npx next start -p 3002   (our API lists the airports)
//   node --env-file=.env.local scripts/destination-guides.mjs [--base=http://localhost:3002] [--only=BRI,FCO] [--redo]
import fs from "node:fs";

const FILE = new URL("../src/data/destinationGuides.json", import.meta.url);
const UA = "Lowfly (https://lowfly.travel)";
const MODEL = process.env.GEMINI_MODEL || "gemini-3.1-flash-lite";
// --name=value, or --name alone for true
const args = Object.fromEntries(process.argv.slice(2).map((arg) => {
  const [name, value = true] = arg.replace(/^--/, "").split("=");
  return [name, value];
}));
const BASE = args.base || "http://localhost:3002";
const ONLY = args.only ? new Set(args.only.split(",")) : null;
const CONCURRENCY = 2;
const RETRIES = 5;
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const guides = fs.existsSync(FILE) ? JSON.parse(fs.readFileSync(FILE, "utf8")) : {};
const save = () => fs.writeFileSync(FILE, JSON.stringify(Object.fromEntries(Object.entries(guides).sort()), null, 1) + "\n");

// Fetches JSON, waiting and retrying when the service is busy (429 rate limit, 503 overloaded)
const json = async (url, options = {}) => {
  for (let attempt = 0; ; attempt++) {
    const response = await fetch(url, { ...options, headers: { "user-agent": UA, ...options.headers } });
    if (response.ok) return response.json();
    if ((response.status === 429 || response.status >= 500) && attempt < RETRIES) {
      await wait(5000 * 2 ** attempt);
      continue;
    }
    throw new Error(`${response.status} ${url.slice(0, 120)}`);
  }
};

const cityNameCandidates = (city) => {
  if (!city) return [];
  const candidates = [];
  const seen = new Set();
  const add = (value) => {
    const cleaned = value?.trim();
    if (!cleaned || seen.has(cleaned)) return;
    seen.add(cleaned);
    candidates.push(cleaned);
  };
  add(city);
  add(city.replace(/\s*[-/].*$/, ""));
  add(city.split(/\s*[-/]/)[0]);
  add(city.replace(/\s*\([^)]*\)\s*$/, ""));
  return candidates;
};

// Airport → the city it serves (the most populated one) → its English and Spanish Wikipedia titles
const cityArticles = async (codes) => {
  const query = `SELECT ?iata ?en ?es ?pop WHERE {
    VALUES ?iata { ${codes.map((code) => `"${code}"`).join(" ")} }
    ?airport wdt:P238 ?iata; wdt:P931 ?city.
    OPTIONAL { ?enPage schema:about ?city; schema:isPartOf <https://en.wikipedia.org/>; schema:name ?en }
    OPTIONAL { ?esPage schema:about ?city; schema:isPartOf <https://es.wikipedia.org/>; schema:name ?es }
    OPTIONAL { ?city wdt:P1082 ?pop }
  }`;
  const data = await json(`https://query.wikidata.org/sparql?query=${encodeURIComponent(query)}`, {
    headers: { accept: "application/sparql-results+json" },
  });
  const best = {};
  for (const row of data.results.bindings) {
    const candidate = { en: row.en?.value, es: row.es?.value, pop: Number(row.pop?.value) || 0 };
    if (!candidate.en) continue;
    const current = best[row.iata.value];
    if (!current || candidate.pop > current.pop) best[row.iata.value] = candidate;
  }
  return best;
};

// Intro of each article: { title: { extract, url } }. `site`: wikipedia or wikivoyage; `full` reads past the intro.
const extracts = async (titles, lang, { site = "wikipedia", full = false } = {}) => {
  // The API gives 20 intros per request but only one full text
  if (full) {
    const found = {};
    let next = 0;
    const worker = async () => {
      while (next < titles.length) {
        const title = titles[next++];
        Object.assign(found, await extracts([title], lang, { site, full: "one" }).catch(() => ({})));
      }
    };
    if (full === true) {
      await Promise.all(Array.from({ length: 6 }, worker));
      return found;
    }
  }
  const found = {};
  for (let start = 0; start < titles.length; start += 20) {
    const batch = titles.slice(start, start + 20);
    const params = new URLSearchParams({
      action: "query", format: "json", formatversion: "2", redirects: "1", prop: "extracts|info",
      explaintext: "1", exlimit: "20", inprop: "url", titles: batch.join("|"),
      ...(full ? { exchars: "2500" } : { exintro: "1", exsentences: "8" }),
    });
    const data = await json(`https://${lang}.${site}.org/w/api.php?${params}`);
    const renamed = new Map([...(data.query.normalized ?? []), ...(data.query.redirects ?? [])].map(({ from, to }) => [from, to]));
    const pages = Object.fromEntries((data.query.pages ?? []).filter((page) => page.extract).map((page) => [page.title, page]));
    for (const title of batch) {
      let final = title;
      for (let step = 0; step < 3 && renamed.has(final); step++) final = renamed.get(final);
      const page = pages[final];
      if (page) found[title] = { extract: page.extract.replace(/\s+/g, " ").trim(), url: page.fullurl };
    }
  }
  return found;
};

const GUIDE = {
  type: "object",
  properties: {
    text: { type: "string", description: "One sentence, under 170 characters" },
    tags: { type: "array", items: { type: "string" }, minItems: 3, maxItems: 3, description: "Three highlights, 1–3 words each" },
  },
  required: ["text", "tags"],
};
const SCHEMA = { type: "object", properties: { es: GUIDE, en: GUIDE }, required: ["es", "en"] };

const write = async ({ code, city, country, english, spanish, guide }) => {
  const input = `You write for Lowfly, a cheap-flights site, to help a traveller decide whether to visit a destination they may not know.
Destination: ${city}, ${country} (airport ${code}).

For each language write:
- "text": ONE sentence (under 170 characters) on why it is worth going: its best-known sight, what makes it special, and if it fits, a typical dish or a famous person from there. Concrete, warm, no clichés like "hidden gem" or "something for everyone".
- "tags": exactly three short highlights (1–3 words each, e.g. "Colosseum", "Roman ruins", "Carbonara").
Prefer what the travel guide highlights (its best-known sights and food). Use only facts stated in the texts below. A typical regional dish may be named only if it is widely known. Never invent people, dates or numbers.
"es" is in Spanish, "en" in English. Use the usual name of places in each language.

English Wikipedia:
${english}

${spanish ? `Spanish Wikipedia:\n${spanish}` : ""}

${guide ? `Wikivoyage travel guide (English):\n${guide}` : ""}`;
  const data = await json("https://generativelanguage.googleapis.com/v1beta/interactions", {
    method: "POST",
    headers: { "content-type": "application/json", "x-goog-api-key": process.env.GEMINI_API_KEY },
    body: JSON.stringify({
      model: MODEL,
      input,
      response_format: { type: "text", mime_type: "application/json", schema: SCHEMA },
      generation_config: { thinking_level: "low" },
    }),
  });
  const text = data.steps.filter((step) => step.type === "model_output").flatMap((step) => step.content).map((part) => part.text).join("");
  return { result: JSON.parse(text), usage: data.usage };
};

const main = async () => {
  if (!process.env.GEMINI_API_KEY) throw new Error("GEMINI_API_KEY is missing (run with --env-file=.env.local)");
  const [{ airports: english }, { airports: spanish }] = await Promise.all([
    json(`${BASE}/api/airports?lang=en`),
    json(`${BASE}/api/airports?lang=es`),
  ]);
  const spanishByCode = Object.fromEntries(spanish.map((airport) => [airport.code, airport]));
  const todo = english.filter((airport) => (!ONLY || ONLY.has(airport.code)) && (args.redo || !guides[airport.code]));
  console.log(`${english.length} airports, ${todo.length} to write`);

  const articles = {};
  for (let start = 0; start < todo.length; start += 50) Object.assign(articles, await cityArticles(todo.slice(start, start + 50).map((airport) => airport.code)));

  const articleCandidates = Object.fromEntries(english.map((airport) => {
    const candidates = cityNameCandidates(airport.city);
    const esCandidates = cityNameCandidates(spanishByCode[airport.code]?.city ?? airport.city);
    return [airport.code, { en: [...new Set(candidates)], es: [...new Set(esCandidates)] }];
  }));

  for (const airport of english) {
    if (articles[airport.code]) continue;
    const fallback = articleCandidates[airport.code];
    if (fallback?.en.length) articles[airport.code] = { en: fallback.en[0], es: fallback.es[0] ?? fallback.en[0], pop: 0 };
  }

  const enTitles = [...new Set(Object.values(articles).map((article) => article.en).filter(Boolean))];
  const esTitles = [...new Set(Object.values(articles).map((article) => article.es).filter(Boolean))];
  const englishTexts = await extracts(enTitles, "en");
  const spanishTexts = await extracts(esTitles, "es");
  // Wikivoyage usually names its guides like the English Wikipedia article ("Rome", "Bari")
  const travelGuides = await extracts(enTitles, "en", { site: "wikivoyage", full: true });

  let done = 0;
  let outputTokens = 0;
  let next = 0;
  const worker = async () => {
    while (next < todo.length) {
      const airport = todo[next++];
      const article = articles[airport.code];
      const enTitle = articleCandidates[airport.code]?.en.find((title) => englishTexts[title]) ?? article.en;
      const en = englishTexts[enTitle];
      if (!en) {
        console.log(`  ${airport.code} ${airport.city}: no Wikipedia article, skipped`);
        continue;
      }
      const esTitle = articleCandidates[airport.code]?.es.find((title) => spanishTexts[title]) ?? article.es;
      const es = esTitle ? spanishTexts[esTitle] : null;
      try {
        const guideTitle = articleCandidates[airport.code]?.en.find((title) => travelGuides[title]) ?? article.en;
        const guide = travelGuides[guideTitle];
        const { result, usage } = await write({
          code: airport.code, city: airport.city, country: airport.country,
          english: en.extract, spanish: es?.extract, guide: guide?.extract,
        });
        outputTokens += usage?.total_output_tokens ?? 0;
        guides[airport.code] = {
          es: { text: result.es.text.trim(), tags: result.es.tags.slice(0, 3) },
          en: { text: result.en.text.trim(), tags: result.en.tags.slice(0, 3) },
          sources: { en: en.url, ...(es ? { es: es.url } : {}), ...(guide ? { guide: guide.url } : {}) },
          city: { en: airport.city, es: spanishByCode[airport.code]?.city ?? airport.city },
        };
        done++;
        if (done % 10 === 0) save();
        console.log(`  ${airport.code} ${airport.city}: ${result.en.text}`);
      } catch (error) {
        console.log(`  ${airport.code} ${airport.city}: failed (${error.message})`);
      }
    }
  };
  await Promise.all(Array.from({ length: CONCURRENCY }, worker));
  save();
  console.log(`Done: ${done} written, ${Object.keys(guides).length} in total, ${outputTokens} output tokens (~$${((outputTokens / 1e6) * 1.5).toFixed(3)})`);
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
