import ManualTripForm from "@/components/trips/ManualTripForm";
import TripsPage from "@/components/trips/TripsPage";
import { I18nProvider } from "@/providers/I18nProvider";
import { APP_NAME, getDictionary } from "@/i18n";

export const generateMetadata = async ({ params }) => {
  const { lang } = await params;
  const t = getDictionary(lang);
  return { title: `${t.trips.manual.title} · ${APP_NAME}`, description: t.trips.manual.subtitle };
};

// Planning a trip by hand (any means of transport, one or more towns), outside "My trips" ?id=… pages
const NewTripPage = async ({ params }) => {
  const { lang } = await params;
  return (
    <I18nProvider lang={lang}>
      <TripsPage>
        <ManualTripForm />
      </TripsPage>
    </I18nProvider>
  );
};

export default NewTripPage;
