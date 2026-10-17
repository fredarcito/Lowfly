// What every shared link of Lowfly says about the site (Open Graph and X cards). A page that sets its own
// openGraph or twitter replaces the layout's whole block (Next does not merge them), so it starts from these.
import { APP_NAME, LOCALES, LOCALE_TAGS } from "@/i18n/config";

// og: site name, type and language, plus the page's own title, description and address (`url`, a path)
export const openGraphOf = (lang, { title, description, url }) => ({
  type: "website",
  siteName: APP_NAME,
  locale: LOCALE_TAGS[lang].replace("-", "_"),
  title,
  description,
  ...(url && { url }),
});

// A page's own address and the same page in each language, for search engines ({ canonical, languages }): `path`
// gives the page's path in a language (ROUTES.privacy). Every page says its own: the layout says none, or each page
// below it would claim to be the home.
export const alternatesOf = (lang, path) => ({
  canonical: path(lang),
  languages: Object.fromEntries(LOCALES.map((locale) => [locale, path(locale)])),
});

// The visitor's own pages (My trips, signing in): nothing there for search engines (the trips live in the browser),
// but their links may be followed
export const PRIVATE_PAGE = { index: false, follow: true };

// The large card on X (the preview image in full)
export const twitterCardOf = ({ title, description }) => ({ card: "summary_large_image", title, description });
