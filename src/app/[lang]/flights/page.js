import AirportsPage from "@/components/flightRoutes/AirportsPage";
import AirportsHero from "@/components/flightRoutes/AirportsPage/components/AirportsHero";
import TripsPage from "@/components/trips/TripsPage";
import { routeTexts } from "@/components/flightRoutes/data/texts";
import { I18nProvider } from "@/providers/I18nProvider";
import { origins } from "@/server/flightRoutes/routes";
import { ROUTES } from "@/constants/routes";
import { alternatesOf, breadcrumbsOf } from "@/utils/metadata";
import JsonLd from "@/components/shared/JsonLd";
import { APP_NAME } from "@/i18n";

// Every airport with route pages, by country (/es/flights): linked from every page's footer, it leads search
// engines to each airport's page and from there to every route. Made again once a day.
export const revalidate = 86400;

export const generateMetadata = async ({ params }) => {
  const { lang } = await params;
  const texts = routeTexts(lang).airportsPage;
  const count = (await origins(lang).catch(() => [])).length;
  return {
    title: texts.metaTitle,
    description: texts.metaDescription(count),
    alternates: alternatesOf(lang, ROUTES.flights),
    openGraph: { title: texts.metaTitle, description: texts.metaDescription(count), url: ROUTES.flights(lang) },
  };
};

const FlightsIndexPage = async ({ params }) => {
  const { lang } = await params;
  const airports = await origins(lang).catch(() => []);
  // The way to the page, for search engines: Lowfly › Cheap flights by airport
  const steps = [
    { name: APP_NAME, path: ROUTES.home(lang) },
    { name: routeTexts(lang).airportsPage.title, path: ROUTES.flights(lang) },
  ];
  return (
    <I18nProvider lang={lang}>
      <JsonLd data={breadcrumbsOf(steps)} />
      <TripsPage hero={<AirportsHero lang={lang} count={airports.length} />}>
        <AirportsPage lang={lang} origins={airports} />
      </TripsPage>
    </I18nProvider>
  );
};

export default FlightsIndexPage;
