import GuidesPage from "@/components/guides/GuidesPage";
import GuidesHero from "@/components/guides/GuidesPage/components/GuidesHero";
import TripsPage from "@/components/trips/TripsPage";
import { guideTexts } from "@/components/guides/data/texts";
import { I18nProvider } from "@/providers/I18nProvider";
import { listCityGuides } from "@/server/cityGuides";
import { getPhotos } from "@/server/photos";
import { ROUTES } from "@/constants/routes";
import { alternatesOf, breadcrumbsOf, openGraphOf } from "@/utils/metadata";
import JsonLd from "@/components/shared/JsonLd";
import { APP_NAME } from "@/i18n";

export const generateMetadata = async ({ params }) => {
  const { lang } = await params;
  const texts = guideTexts(lang).list;
  return {
    title: texts.metaTitle,
    description: texts.metaDescription,
    alternates: alternatesOf(lang, ROUTES.guides),
    openGraph: openGraphOf(lang, { title: texts.metaTitle, description: texts.metaDescription, url: ROUTES.guides(lang) }),
  };
};

// Every city's photo is read again once a day
export const revalidate = 86400;

// Every city guide: /es/guias, each with its photo: its own, or its city's
const CityGuidesPage = async ({ params }) => {
  const { lang } = await params;
  const texts = guideTexts(lang).list;
  const guides = listCityGuides(lang);
  const cityPhotos = await getPhotos(guides.filter((guide) => !guide.photo).map((guide) => guide.codes[0])).catch(() => ({}));
  const photos = Object.fromEntries(guides.map((guide) => [guide.slug, guide.photo ?? cityPhotos[guide.codes[0]] ?? null]));
  const breadcrumbs = breadcrumbsOf([
    { name: APP_NAME, path: ROUTES.home(lang) },
    { name: texts.title, path: ROUTES.guides(lang) },
  ]);
  return (
    <I18nProvider lang={lang}>
      <JsonLd data={breadcrumbs} />
      <TripsPage hero={<GuidesHero lang={lang} />}>
        <GuidesPage lang={lang} guides={guides} photos={photos} />
      </TripsPage>
    </I18nProvider>
  );
};

export default CityGuidesPage;
