// What every shared link of Lowfly says about the site (Open Graph and X cards). A page that sets its own
// openGraph or twitter replaces the layout's whole block (Next does not merge them), so it starts from these.
import { APP_NAME, LOCALE_TAGS } from "@/i18n/config";

// og: site name, type and language, plus the page's own title, description and address (`url`, a path)
export const openGraphOf = (lang, { title, description, url }) => ({
  type: "website",
  siteName: APP_NAME,
  locale: LOCALE_TAGS[lang].replace("-", "_"),
  title,
  description,
  ...(url && { url }),
});

// The large card on X (the preview image in full)
export const twitterCardOf = ({ title, description }) => ({ card: "summary_large_image", title, description });
