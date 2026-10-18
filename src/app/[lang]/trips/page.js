import { Suspense } from "react";
import TripsApp from "@/components/trips/TripsApp";
import { I18nProvider } from "@/providers/I18nProvider";
import { APP_NAME, getDictionary } from "@/i18n";
import { ROUTES } from "@/constants/routes";
import { PRIVATE_PAGE, alternatesOf, openGraphOf } from "@/utils/metadata";

export const generateMetadata = async ({ params }) => {
  const { lang } = await params;
  const texts = getDictionary(lang);
  const [title, description] = [`${texts.trips.title} · ${APP_NAME}`, texts.trips.subtitle];
  return { title, description, robots: PRIVATE_PAGE, alternates: alternatesOf(lang, ROUTES.trips), openGraph: openGraphOf(lang, { title, description, url: ROUTES.trips(lang) }) };
};

// "My trips". The trips live in the browser (localStorage), so the page is rendered there;
// Suspense is needed because it reads ?id from the URL.
const TripsPage = async ({ params }) => {
  const { lang } = await params;
  return (
    <I18nProvider lang={lang}>
      <Suspense>
        <TripsApp />
      </Suspense>
    </I18nProvider>
  );
};

export default TripsPage;
