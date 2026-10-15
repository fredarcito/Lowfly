import FlightSearch from "@/components/search/FlightSearch";
import { I18nProvider } from "@/providers/I18nProvider";
import { getDictionary } from "@/i18n";
import { ROUTES } from "@/constants/routes";
import { openGraphOf } from "@/utils/metadata";

// The home page's own address in its preview (og:url), on top of the layout's title and description
export const generateMetadata = async ({ params }) => {
  const { lang } = await params;
  const { meta } = getDictionary(lang);
  return { openGraph: openGraphOf(lang, { title: meta.title, description: meta.description, url: ROUTES.home(lang) }) };
};

const Page = async ({ params }) => {
  const { lang } = await params;
  return (
    <I18nProvider lang={lang}>
      <FlightSearch />
    </I18nProvider>
  );
};

export default Page;
