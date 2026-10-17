import ManualTripForm from "@/components/trips/ManualTripForm";
import TripsPage from "@/components/trips/TripsPage";
import { I18nProvider } from "@/providers/I18nProvider";
import { APP_NAME, getDictionary } from "@/i18n";
import { getAirports } from "@/server/airports";
import { ROUTES } from "@/constants/routes";
import { alternatesOf } from "@/utils/metadata";

export const generateMetadata = async ({ params }) => {
  const { lang } = await params;
  const texts = getDictionary(lang);
  // The planner itself, whatever town it starts with (?to=BCN): one page for search engines
  return { title: `${texts.trips.manual.title} · ${APP_NAME}`, description: texts.trips.manual.subtitle, alternates: alternatesOf(lang, (locale) => ROUTES.newTrip(locale)) };
};

// The town of the airport `code` as the form's first stop (?to=BCN, from a route's page), or null
const placeOf = async (code, lang) => {
  if (!/^[A-Z]{3}$/.test(code ?? "")) return null;
  const { airports } = await getAirports(lang).catch(() => ({ airports: [] }));
  const airport = airports.find((candidate) => candidate.code === code);
  if (!airport || airport.lat == null) return null;
  return { id: `airport-${code}`, name: airport.city, region: null, country: airport.country, countryCode: airport.countryCode, lat: airport.lat, lng: airport.lon, code };
};

// Planning a trip by hand (any means of transport, one or more towns), outside "My trips" ?id=… pages.
// ?to=BCN starts with that airport's town.
const NewTripPage = async ({ params, searchParams }) => {
  const { lang } = await params;
  const initialPlace = await placeOf(String((await searchParams).to ?? "").toUpperCase(), lang);
  return (
    <I18nProvider lang={lang}>
      <TripsPage>
        <ManualTripForm initialPlace={initialPlace} />
      </TripsPage>
    </I18nProvider>
  );
};

export default NewTripPage;
