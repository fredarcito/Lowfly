import { SITE_DOMAIN } from "@/constants/site";

// /robots.txt: search engines may read every page but the admin, the API and the shared trips (private by link),
// and find them all in the sitemap
const robots = () => ({
  rules: { userAgent: "*", allow: "/", disallow: ["/api/", "/es/admin", "/en/admin", "/es/shared/", "/en/shared/"] },
  sitemap: `https://${SITE_DOMAIN}/sitemap.xml`,
});

export default robots;
