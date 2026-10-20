// A kind of search's own page (app/[lang]/(search)/…, constants/searchPages): what search engines and shared links
// read of it, in its language
import { APP_NAME, getDictionary } from "@/i18n";
import { ROUTES } from "@/constants/routes";
import { alternatesOf, openGraphOf } from "@/utils/metadata";

export const searchPageMetadata = async (params, mode) => {
  const { lang } = await params;
  const { title, description } = getDictionary(lang).searchPages[mode];
  const fullTitle = `${title} · ${APP_NAME}`;
  return {
    title: fullTitle,
    description,
    alternates: alternatesOf(lang, (locale) => ROUTES.search(locale, mode)),
    openGraph: openGraphOf(lang, { title: fullTitle, description, url: ROUTES.search(lang, mode) }),
  };
};
