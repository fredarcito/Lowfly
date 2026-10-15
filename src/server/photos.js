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
    VALUES ?iata { ${codes.map((code) => `"${code}"`).join(" ")} }
    ?airport wdt:P238 ?iata; wdt:P931 ?city.
    ?article schema:about ?city; schema:isPartOf <https://en.wikipedia.org/>.
    OPTIONAL { ?city wdt:P1082 ?pop }
  }`;
  const response = await fetch(`https://query.wikidata.org/sparql?query=${encodeURIComponent(query)}`, {
    headers: { accept: "application/sparql-results+json", "user-agent": UA },
    next: { revalidate: MONTH },
  });
  if (!response.ok) throw new Error(`Wikidata responded with error ${response.status}`);
  // Per airport, its cities' articles from most to least populated: { TSF: ["Venice", "Treviso"] }
  const found = {};
  for (const binding of (await response.json()).results.bindings) {
    const title = decodeURIComponent(binding.article.value.split("/wiki/").pop()).replace(/_/g, " ");
    (found[binding.iata.value] ??= []).push({ title, pop: Number(binding.pop?.value) || 0 });
  }
  return Object.fromEntries(
    Object.entries(found).map(([code, list]) => [code, [...new Set(list.sort((first, second) => second.pop - first.pop).map((first) => first.title))]])
  );
};

// Lead images that are not photos of the place: maps, flags, coats of arms, logos, diagrams
const notAPhoto = (file) => !file || /\.(svg|png|gif)$/i.test(file) || /(^|[_ -])(map|flag|coat|locator|logo|seal)/i.test(file);

// Lead image file of each article: { "Venice": "Venezia_aerial_view.jpg" }
const leadImages = async (titles) => {
  const response = await fetch(
    `https://en.wikipedia.org/w/api.php?action=query&format=json&prop=pageimages&piprop=name&redirects=1&titles=${encodeURIComponent(titles.join("|"))}`,
    { headers: { "user-agent": UA }, next: { revalidate: MONTH } }
  );
  if (!response.ok) throw new Error(`Wikipedia responded with error ${response.status}`);
  const result = (await response.json()).query || {};
  const files = Object.fromEntries(Object.values(result.pages || {}).map((page) => [page.title, page.pageimage]));
  // The answer uses the final title: map back the ones we asked for under another name
  for (const { from, to } of [...(result.normalized || []), ...(result.redirects || [])]) files[from] ??= files[to];
  return files;
};

const plain = (html = "") => html.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();

const commons = async (files) => {
  const titles = files.map((file) => `File:${file}`).join("|");
  const response = await fetch(
    `https://commons.wikimedia.org/w/api.php?action=query&format=json&prop=imageinfo&iiprop=url|extmetadata&iiurlwidth=800&titles=${encodeURIComponent(titles)}`,
    { headers: { "user-agent": UA }, next: { revalidate: MONTH } }
  );
  if (!response.ok) throw new Error(`Commons responded with error ${response.status}`);
  const byFile = {};
  for (const page of Object.values((await response.json()).query?.pages || {})) {
    const ii = page.imageinfo?.[0];
    if (!ii?.thumburl) continue;
    byFile[page.title.replace(/^File:/, "")] = {
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
  const missing = codes.filter((code) => !cache.has(code));
  if (missing.length) {
    const articles = await cityArticles(missing);
    const titles = [...new Set(Object.values(articles).flat())];
    const lead = titles.length ? await leadImages(titles) : {};
    const files = [...new Set(Object.values(lead).filter(Boolean))];
    const info = files.length ? await commons(files) : {};
    // Commons may normalise the file name (underscores, capitals): compare loosely
    const norm = (title) => title.replace(/_/g, " ").toLowerCase();
    const byNorm = Object.fromEntries(Object.entries(info).map(([title, value]) => [norm(title), value]));
    for (const code of missing) {
      const file = (articles[code] || []).map((title) => lead[title]).find((candidate) => !notAPhoto(candidate));
      cache.set(code, file ? byNorm[norm(file)] ?? null : null);
    }
  }
  return Object.fromEntries(codes.map((code) => [code, cache.get(code)]));
};
