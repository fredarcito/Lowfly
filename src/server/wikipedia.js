// Facts about places from Wikipedia: a short summary (the "history" of a stop), its link and coordinates.
// Free, and the source is real: the AI names the article, the text comes from Wikipedia itself.
const UA = "Lowfly (https://lowfly-one.vercel.app)";
const MONTH = 30 * 86400;
const BATCH = 20; // intro extracts per request (the API maximum)

// Plain text without invisible characters or doubled spaces
const cleanExtract = (extract) => extract.replace(/[\u200b\u200e\u200f]/g, "").replace(/\s+/g, " ").trim();

const toFact = (page) => ({
  title: page.title,
  extract: cleanExtract(page.extract),
  url: page.fullurl,
  lat: page.coordinates?.[0]?.lat,
  lng: page.coordinates?.[0]?.lon,
});

// The best article for a free-text search ("Castello Normanno-Svevo Bari"), or null.
// It may be about another place with the same name: callers must check where it is.
export async function searchPlace(query, lang) {
  const params = new URLSearchParams({
    action: "query",
    format: "json",
    formatversion: "2",
    generator: "search",
    gsrsearch: query,
    gsrlimit: "1",
    prop: "extracts|coordinates|info",
    exintro: "1",
    explaintext: "1",
    exsentences: "3",
    inprop: "url",
  });
  try {
    const response = await fetch(`https://${lang}.wikipedia.org/w/api.php?${params}`, {
      headers: { "user-agent": UA },
      next: { revalidate: MONTH },
    });
    if (!response.ok) return null;
    const page = (await response.json()).query?.pages?.[0];
    return page?.extract ? toFact(page) : null;
  } catch (error) {
    console.error("Wikipedia search error", error);
    return null;
  }
}

// { "Colosseum": { title, extract, url, lat, lng } } for the articles found, in that language's Wikipedia
export async function placeFacts(titles, lang) {
  const unique = [...new Set(titles.filter(Boolean))];
  const facts = {};
  for (let start = 0; start < unique.length; start += BATCH) {
    const batch = unique.slice(start, start + BATCH);
    const params = new URLSearchParams({
      action: "query",
      format: "json",
      formatversion: "2",
      redirects: "1",
      prop: "extracts|coordinates|info",
      exintro: "1",
      explaintext: "1",
      exsentences: "3",
      exlimit: String(BATCH),
      inprop: "url",
      titles: batch.join("|"),
    });
    try {
      const response = await fetch(`https://${lang}.wikipedia.org/w/api.php?${params}`, {
        headers: { "user-agent": UA },
        next: { revalidate: MONTH },
      });
      if (!response.ok) continue;
      const query = (await response.json()).query ?? {};
      const byTitle = {};
      for (const page of query.pages ?? []) {
        if (page.missing || !page.extract) continue;
        byTitle[page.title] = toFact(page);
      }
      // Answers use the final title: follow the normalisations and redirects back to the names we asked for
      const renamed = new Map([...(query.normalized ?? []), ...(query.redirects ?? [])].map(({ from, to }) => [from, to]));
      const finalTitle = (title) => {
        let current = title;
        for (let step = 0; step < 3 && renamed.has(current); step++) current = renamed.get(current);
        return current;
      };
      for (const title of batch) if (byTitle[finalTitle(title)]) facts[title] = byTitle[finalTitle(title)];
    } catch (error) {
      console.error("Wikipedia error", error);
    }
  }
  return facts;
}
