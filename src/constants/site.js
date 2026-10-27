// Lowfly's own address, and how its server introduces itself to the free services it asks (Wikipedia, Wikimedia,
// the maps): they want to know who calls
export const SITE_DOMAIN = "lowfly.travel";
export const USER_AGENT = `Lowfly (https://${SITE_DOMAIN})`;

// IndexNow's key (server/indexNow): public by design, served as /<key>.txt (public/) to prove the site is ours
export const INDEX_NOW_KEY = "92d1ab7370ef429a94e0d07f4ba62f20";
