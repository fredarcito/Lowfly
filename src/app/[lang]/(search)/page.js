import { getDictionary } from "@/i18n";
import { ROUTES } from "@/constants/routes";
import { alternatesOf, openGraphOf, siteOf } from "@/utils/metadata";
import PageTop from "@/components/shared/PageTop";
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

// The home: the search (its layout, searching "anywhere") and who Lowfly is, for search engines (its name and logo in
// the results)
const Page = async ({ params }) => {
  const { lang } = await params;
  return (
    <>
      <PageTop />
      <JsonLd data={siteOf(lang, getDictionary(lang).meta.description)} />
    </>
  );
};

export default Page;
