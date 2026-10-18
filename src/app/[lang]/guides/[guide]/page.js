import { notFound } from "next/navigation";
import GuidePage from "@/components/guides/GuidePage";
import GuideHero from "@/components/guides/GuidePage/components/GuideHero";
import TripsPage from "@/components/trips/TripsPage";
import { guideTexts } from "@/components/guides/data/texts";
import { I18nProvider } from "@/providers/I18nProvider";
import { LOCALES } from "@/i18n/config";
import { APP_NAME, LOCALE_TAGS } from "@/i18n";
import { getCityGuide, listCityGuides } from "@/server/cityGuides";
import { getPhotos } from "@/server/photos";
import { ROUTES } from "@/constants/routes";
import { SITE_URL, alternatesOf, breadcrumbsOf, openGraphOf } from "@/utils/metadata";
import JsonLd from "@/components/shared/JsonLd";

// A city guide (/es/guides/rome-3-days): its itinerary as scripts/city-guides.mjs wrote it (never made on a visit),
// every guide made at build time; the city's photo is read again once a day
export const revalidate = 86400;
export const dynamicParams = false;
export const generateStaticParams = () => LOCALES.flatMap((lang) => listCityGuides(lang).map((guide) => ({ lang, guide: guide.slug })));

// Its own photo, or its city's usual one
const photoOf = async (guide) => guide.photo ?? (await getPhotos([guide.codes[0]]).catch(() => ({})))[guide.codes[0]] ?? null;

export const generateMetadata = async ({ params }) => {
  const { lang, guide: slug } = await params;
  const guide = getCityGuide(slug, lang);
  if (!guide) return {};
  const title = guideTexts(lang).metaTitle(guide.city, guide.dayCount);
  const description = guide.intro.summary;
  const photo = await photoOf(guide);
  return {
    title,
    description,
    alternates: alternatesOf(lang, (locale) => ROUTES.guide(locale, slug)),
    openGraph: openGraphOf(lang, { title, description, url: ROUTES.guide(lang, slug), image: photo?.src }),
  };
};

// For search engines: the way to it (Lowfly › Travel guides › the guide) and the trip itself, day by day, each day
// a list of its places (schema.org TouristTrip)
const structuredData = (lang, guide) => {
  const texts = guideTexts(lang);
  const path = ROUTES.guide(lang, guide.slug);
  const trip = {
    "@context": "https://schema.org",
    "@type": "TouristTrip",
    name: texts.title(guide.city, guide.dayCount),
    description: guide.intro.summary,
    inLanguage: LOCALE_TAGS[lang],
    url: `${SITE_URL}${path}`,
    itinerary: {
      "@type": "ItemList",
      itemListElement: guide.itinerary.days.map((day, index) => ({
        "@type": "ListItem",
        position: index + 1,
        item: {
          "@type": "ItemList",
          name: `${texts.day(index + 1)}: ${day.title}`,
          itemListElement: day.stops
            .filter((stop) => stop.place && stop.type !== "comida")
            .map((stop, stopIndex) => ({
              "@type": "ListItem",
              position: stopIndex + 1,
              item: { "@type": "TouristAttraction", name: stop.title, geo: { "@type": "GeoCoordinates", latitude: stop.place.lat, longitude: stop.place.lng } },
            })),
        },
      })),
    },
  };
  const breadcrumbs = breadcrumbsOf([
    { name: APP_NAME, path: ROUTES.home(lang) },
    { name: texts.list.title, path: ROUTES.guides(lang) },
    { name: texts.title(guide.city, guide.dayCount), path },
  ]);
  return [breadcrumbs, trip];
};

const CityGuidePage = async ({ params }) => {
  const { lang, guide: slug } = await params;
  const guide = getCityGuide(slug, lang);
  if (!guide) notFound();
  const photo = await photoOf(guide);
  const [breadcrumbs, trip] = structuredData(lang, guide);
  return (
    <I18nProvider lang={lang}>
      <JsonLd data={breadcrumbs} />
      <JsonLd data={trip} />
      <TripsPage hero={<GuideHero lang={lang} guide={guide} photo={photo} href={ROUTES.newTrip(lang, guide.codes[0])} />}>
        <GuidePage lang={lang} guide={guide} />
      </TripsPage>
    </I18nProvider>
  );
};

export default CityGuidePage;
