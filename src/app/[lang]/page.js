import FlightSearch from "@/components/search/FlightSearch";
import { I18nProvider } from "@/providers/I18nProvider";
import { getDictionary } from "@/i18n";
import { ROUTES } from "@/constants/routes";
import { alternatesOf, openGraphOf, siteOf } from "@/utils/metadata";
import JsonLd from "@/components/shared/JsonLd";

// The home page's own address in its preview (og:url), on top of the layout's title and description
export const generateMetadata = async ({ params }) => {
  const { lang } = await params;
  const { meta } = getDictionary(lang);
  return {
    alternates: alternatesOf(lang, ROUTES.home),
    openGraph: openGraphOf(lang, { title: meta.title, description: meta.description, url: ROUTES.home(lang), image: null }),
  };
};

const Page = async ({ params }) => {
  const { lang } = await params;
  // Who Lowfly is, for search engines: its name and logo in the results
  return (
    <I18nProvider lang={lang}>
      <JsonLd data={siteOf(lang, getDictionary(lang).meta.description)} />
      <FlightSearch />
    </I18nProvider>
  );
};

export default Page;
