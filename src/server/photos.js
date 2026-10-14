// Destination photos, found by airport code. Only called from the server.
// Wikidata: airport (IATA code) → city it serves → its English Wikipedia article. When an airport serves
// several cities (Treviso: Venice and Treviso) the most populated one with a real photo wins.
// Wikipedia: the article's lead image (curated, nicer than Wikidata's own image).
// Wikimedia Commons: an 800 px thumbnail plus author and licence, needed to credit the photo.
const UA = "Lowfly (https://lowfly-one.vercel.app)";
const MONTH = 30 * 86400;
const cache = new Map(); // code → photo or null, for the life of the server instance

const cityArticles = async (codes) => {
  const query = `SELECT ?iata ?article ?pop WHERE {
    VALUES ?iata { ${codes.map((c) => `"${c}"`).join(" ")} }
    ?airport wdt:P238 ?iata; wdt:P931 ?city.
    ?article schema:about ?city; schema:isPartOf <https://en.wikipedia.org/>.
    OPTIONAL { ?city wdt:P1082 ?pop }
  }`;
  const r = await fetch(`https://query.wikidata.org/sparql?query=${encodeURIComponent(query)}`, {
    headers: { accept: "application/sparql-results+json", "user-agent": UA },
    next: { revalidate: MONTH },
  });
  if (!r.ok) throw new Error(`Wikidata responded with error ${r.status}`);
  // Per airport, its cities' articles from most to least populated: { TSF: ["Venice", "Treviso"] }
  const found = {};
  for (const b of (await r.json()).results.bindings) {
    const title = decodeURIComponent(b.article.value.split("/wiki/").pop()).replace(/_/g, " ");
    (found[b.iata.value] ??= []).push({ title, pop: Number(b.pop?.value) || 0 });
  }
  return Object.fromEntries(
    Object.entries(found).map(([code, list]) => [code, [...new Set(list.sort((a, b) => b.pop - a.pop).map((a) => a.title))]])
  );
};

// Lead images that are not photos of the place: maps, flags, coats of arms, logos, diagrams
const notAPhoto = (file) => !file || /\.(svg|png|gif)$/i.test(file) || /(^|[_ -])(map|flag|coat|locator|logo|seal)/i.test(file);

// Lead image file of each article: { "Venice": "Venezia_aerial_view.jpg" }
const leadImages = async (titles) => {
  const r = await fetch(
    `https://en.wikipedia.org/w/api.php?action=query&format=json&prop=pageimages&piprop=name&redirects=1&titles=${encodeURIComponent(titles.join("|"))}`,
    { headers: { "user-agent": UA }, next: { revalidate: MONTH } }
  );
  if (!r.ok) throw new Error(`Wikipedia responded with error ${r.status}`);
  const q = (await r.json()).query || {};
  const files = Object.fromEntries(Object.values(q.pages || {}).map((p) => [p.title, p.pageimage]));
  // The answer uses the final title: map back the ones we asked for under another name
  for (const { from, to } of [...(q.normalized || []), ...(q.redirects || [])]) files[from] ??= files[to];
  return files;
};

const plain = (html = "") => html.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();

const commons = async (files) => {
  const titles = files.map((f) => `File:${f}`).join("|");
  const r = await fetch(
    `https://commons.wikimedia.org/w/api.php?action=query&format=json&prop=imageinfo&iiprop=url|extmetadata&iiurlwidth=800&titles=${encodeURIComponent(titles)}`,
    { headers: { "user-agent": UA }, next: { revalidate: MONTH } }
  );
  if (!r.ok) throw new Error(`Commons responded with error ${r.status}`);
  const byFile = {};
  for (const p of Object.values((await r.json()).query?.pages || {})) {
    const ii = p.imageinfo?.[0];
    if (!ii?.thumburl) continue;
    byFile[p.title.replace(/^File:/, "")] = {
      src: ii.thumburl,
      width: ii.thumbwidth,
      height: ii.thumbheight,
      page: ii.descriptionurl,
      author: plain(ii.extmetadata?.Artist?.value),
      license: plain(ii.extmetadata?.LicenseShortName?.value),
    };
  }
  return byFile;
};

// { CTA: { src, width, height, page, author, license }, NRN: null, … }
export const getPhotos = async (codes) => {
  const missing = codes.filter((c) => !cache.has(c));
  if (missing.length) {
    const articles = await cityArticles(missing);
    const titles = [...new Set(Object.values(articles).flat())];
    const lead = titles.length ? await leadImages(titles) : {};
    const files = [...new Set(Object.values(lead).filter(Boolean))];
    const info = files.length ? await commons(files) : {};
    // Commons may normalise the file name (underscores, capitals): compare loosely
    const norm = (s) => s.replace(/_/g, " ").toLowerCase();
    const byNorm = Object.fromEntries(Object.entries(info).map(([k, v]) => [norm(k), v]));
    for (const c of missing) {
      const file = (articles[c] || []).map((t) => lead[t]).find((f) => !notAPhoto(f));
      cache.set(c, file ? byNorm[norm(file)] ?? null : null);
    }
  }
  return Object.fromEntries(codes.map((c) => [c, cache.get(c)]));
};
