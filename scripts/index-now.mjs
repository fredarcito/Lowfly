// Tells IndexNow (Bing, Yandex, Seznam, Naver, Yep) about pages, by hand. Not needed day to day: the route pages'
// cron tells it every night about the airports and every page new, edited or gone (server/indexNow,
// server/pageChanges). For a page to be told now, or --sitemap: every page in the live sitemap (not every day: the
// search engines would start ignoring us). Only live pages: run it once the deploy is done.
//
//   node scripts/index-now.mjs /es/guias/roma-3-dias /en/guides/rome-3-days
//   node scripts/index-now.mjs --sitemap
import { INDEX_NOW_KEY, SITE_DOMAIN } from "../src/constants/site.js";

const SITE_URL = `https://${SITE_DOMAIN}`;
// The most it takes in one request
const MAX_URLS = 10_000;

const sitemapUrls = async () => {
  const response = await fetch(`${SITE_URL}/sitemap.xml`);
  if (!response.ok) throw new Error(`sitemap.xml: ${response.status}`);
  return [...(await response.text()).matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
};

const args = process.argv.slice(2);
const urls = args.includes("--sitemap") ? await sitemapUrls() : args.map((path) => (path.startsWith("http") ? path : `${SITE_URL}${path}`));
if (!urls.length) {
  console.error("Which pages? node scripts/index-now.mjs /es/guias/roma-3-dias … (or --sitemap)");
  process.exit(1);
}

for (let start = 0; start < urls.length; start += MAX_URLS) {
  const batch = urls.slice(start, start + MAX_URLS);
  const response = await fetch("https://api.indexnow.org/indexnow", {
    method: "POST",
    headers: { "content-type": "application/json; charset=utf-8" },
    body: JSON.stringify({ host: SITE_DOMAIN, key: INDEX_NOW_KEY, keyLocation: `${SITE_URL}/${INDEX_NOW_KEY}.txt`, urlList: batch }),
  });
  console.log(`${batch.length} pages: IndexNow responded with ${response.status}`);
}
