// What every shared link of Lowfly says about the site (Open Graph and X cards). A page that sets its own
// openGraph or twitter replaces the layout's whole block (Next does not merge them), so it starts from these.
import { APP_NAME, DEFAULT_LOCALE, LOCALES, LOCALE_TAGS } from "@/i18n/config";
import { SITE_DOMAIN } from "@/constants/site";

// og: site name, type and language, plus the page's own title, description and address (`url`, a path)
export const openGraphOf = (lang, { title, description, url }) => ({
  type: "website",
  siteName: APP_NAME,
  locale: LOCALE_TAGS[lang].replace("-", "_"),
  title,
  description,
  ...(url && { url }),
});

// The site's address, for what search engines need absolute (structured data)
export const SITE_URL = `https://${SITE_DOMAIN}`;

// The same page in each language ({ es, en, x-default }): `path` gives the page's path in a language. x-default,
// for a visitor of any other language, is the address without one (/flights/malta): it sends them to theirs.
export const languagesOf = (path) => {
  const languages = Object.fromEntries(LOCALES.map((locale) => [locale, path(locale)]));
  return { ...languages, "x-default": languages[DEFAULT_LOCALE].replace(new RegExp(`^/${DEFAULT_LOCALE}(?=/|$)`), "") || "/" };
};

// A page's own address and the same page in each language, for search engines ({ canonical, languages }): `path`
// gives the page's path in a language (ROUTES.privacy). Every page says its own: the layout says none, or each page
// below it would claim to be the home.
export const alternatesOf = (lang, path) => ({ canonical: path(lang), languages: languagesOf(path) });

// The way to a page, for search engines (schema.org BreadcrumbList): `steps` [{ name, path }], from the home
export const breadcrumbsOf = (steps) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: steps.map((step, index) => ({ "@type": "ListItem", position: index + 1, name: step.name, item: `${SITE_URL}${step.path}` })),
});

// Who Lowfly is, for search engines (its name and logo in the results): the site and the organisation behind it
export const siteOf = (lang, description) => ({
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: `${SITE_URL}/${lang}`,
      name: APP_NAME,
      description,
      inLanguage: LOCALE_TAGS[lang],
      publisher: { "@id": `${SITE_URL}/#organization` },
    },
    { "@type": "Organization", "@id": `${SITE_URL}/#organization`, name: APP_NAME, url: SITE_URL, logo: `${SITE_URL}/apple-icon.png` },
  ],
});

// The visitor's own pages (My trips, signing in): nothing there for search engines (the trips live in the browser),
// but their links may be followed
export const PRIVATE_PAGE = { index: false, follow: true };

// The large card on X (the preview image in full)
export const twitterCardOf = ({ title, description }) => ({ card: "summary_large_image", title, description });
