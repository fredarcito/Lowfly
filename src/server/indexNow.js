// IndexNow: tells Bing (and Yandex, Seznam, Naver, Yep, which share it) at once which pages are new or changed,
// instead of waiting for them to read the sitemap again. Google does not take part: the sitemap is enough for it.
// Only production sends: a preview or a dev server would announce pages that are not live. Never throws: a failed
// ping only means waiting for the sitemap. Only called from the server.
import { INDEX_NOW_KEY, SITE_DOMAIN } from "@/constants/site";
import { SITE_URL } from "@/utils/metadata";

const ENDPOINT = "https://api.indexnow.org/indexnow";
// The most it takes in one request
const MAX_URLS = 10_000;

// Announces `paths` (/es/flights/malta…): { urls (how many), sent }
export const announcePages = async (paths) => {
  const urls = [...new Set(paths)].slice(0, MAX_URLS).map((path) => `${SITE_URL}${path}`);
  if (!urls.length || process.env.VERCEL_ENV !== "production") return { urls: urls.length, sent: false };
  try {
    const response = await fetch(ENDPOINT, {
      method: "POST",
      headers: { "content-type": "application/json; charset=utf-8" },
      body: JSON.stringify({ host: SITE_DOMAIN, key: INDEX_NOW_KEY, keyLocation: `${SITE_URL}/${INDEX_NOW_KEY}.txt`, urlList: urls }),
    });
    if (!response.ok) console.error("IndexNow responded with", response.status);
    return { urls: urls.length, sent: response.ok };
  } catch (error) {
    console.error("IndexNow", error.message);
    return { urls: urls.length, sent: false };
  }
};
