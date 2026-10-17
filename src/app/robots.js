import { SITE_DOMAIN } from "@/constants/site";

// /robots.txt: search engines may read every page but the admin and the API, and find them all in the sitemap.
// The shared trips (private by link) are not blocked here but say noindex themselves: blocked, a search engine could
// never read that noindex, and could still list a shared link it found elsewhere.
const robots = () => ({
  rules: { userAgent: "*", allow: "/", disallow: ["/api/", "/es/admin", "/en/admin"] },
  sitemap: `https://${SITE_DOMAIN}/sitemap.xml`,
});

export default robots;
