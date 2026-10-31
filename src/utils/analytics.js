import { track as trackOnVercel } from "@vercel/analytics";
import { MORE_AIRLINES } from "@/constants/airlines";
import { VERCEL_ANALYTICS } from "@/constants/analytics";

// Sends the event `name` to Google Analytics (components/layout/Analytics), when it is loaded, and to Vercel's
// (components/layout/VercelAnalytics): never on this machine or in the tests. Vercel only takes plain values, so
// the empty ones are left out.
export const track = (name, params = {}) => {
  if (typeof window === "undefined") return;
  window.gtag?.("event", name, params);
  if (VERCEL_ANALYTICS) trackOnVercel(name, Object.fromEntries(Object.entries(params).filter(([, value]) => value != null)));
};

const hostOf = (url) => new URL(url).hostname.replace(/^www\./, "");

// The airlines' sites, by host: "ryanair.com" → "ryanair"
const AIRLINE_HOSTS = {
  "ryanair.com": "ryanair",
  "wizzair.com": "wizz",
  ...Object.fromEntries(Object.entries(MORE_AIRLINES).map(([airline, { home }]) => [hostOf(home), airline])),
};

// Where a booking link goes, as each airline writes it: [origin, destination] airport codes, or []
const routeOf = (url) => {
  const ryanair = [url.searchParams.get("originIata"), url.searchParams.get("destinationIata")];
  const easyjet = [url.searchParams.get("dep"), url.searchParams.get("dest")];
  const wizz = /\/select-flight\/([A-Z]{3})\/([A-Z]{3})\//.exec(url.pathname)?.slice(1) ?? [];
  return [ryanair, easyjet, wizz].find(([origin, destination]) => origin && destination) ?? [];
};

// A link to an airline's site (the "Book" buttons): { airline, origin, destination } (codes when the address has
// them), or null for any other link
export const bookingOf = (href) => {
  let url;
  try {
    url = new URL(href);
  } catch {
    return null;
  }
  const airline = AIRLINE_HOSTS[hostOf(url.href)];
  if (!airline) return null;
  const [origin, destination] = routeOf(url);
  return { airline, ...(origin && { origin, destination }) };
};
