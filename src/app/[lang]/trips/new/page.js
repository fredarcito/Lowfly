import ManualTripForm from "@/components/trips/ManualTripForm";
import TripsPage from "@/components/trips/TripsPage";
import { I18nProvider } from "@/providers/I18nProvider";
import { APP_NAME, getDictionary } from "@/i18n";
import { getAirports } from "@/server/airports";
import { ROUTES } from "@/constants/routes";
import { alternatesOf, openGraphOf } from "@/utils/metadata";
import { stopsFromParam } from "@/utils/manualTrips";

export const generateMetadata = async ({ params }) => {
  const { lang } = await params;
  const texts = getDictionary(lang);
  // The planner itself, whatever town it starts with (?to=BCN): one page for search engines
  const [title, description] = [`${texts.trips.manual.title} · ${APP_NAME}`, texts.trips.manual.subtitle];
  return {
    title,
    description,
    alternates: alternatesOf(lang, (locale) => ROUTES.newTrip(locale)),
    openGraph: openGraphOf(lang, { title, description, url: ROUTES.newTrip(lang) }),
  };
};

// The town of the airport `code` as the form's first stop (?to=BCN, from a route's page), or null
const placeOf = async (code, lang) => {
  if (!/^[A-Z]{3}$/.test(code ?? "")) return null;
  const { airports } = await getAirports(lang).catch(() => ({ airports: [] }));
  const airport = airports.find((candidate) => candidate.code === code);
  if (!airport || airport.lat == null) return null;
  return { id: `airport-${code}`, name: airport.city, region: null, country: airport.country, countryCode: airport.countryCode, lat: airport.lat, lng: airport.lon, code };
};

// Every town of a ?stops=… link (a trip through a hub, from the search) with its days and times, or null
const stopsOf = async (text, lang) => {
  const stops = stopsFromParam(text);
  const places = await Promise.all(stops.map((stop) => placeOf(stop.code, lang)));
  const known = stops.map((stop, index) => ({ ...stop, place: places[index] })).filter((stop) => stop.place);
  return known.length ? known : null;
};

// Planning a trip by hand (any means of transport, one or more towns), outside "My trips" ?id=… pages.
// ?to=BCN starts with that airport's town; ?stops=… (utils/manualTrips stopsParam) with every town and its dates.
const NewTripPage = async ({ params, searchParams }) => {
  const { lang } = await params;
  const query = await searchParams;
  const [initialPlace, initialStops] = await Promise.all([placeOf(String(query.to ?? "").toUpperCase(), lang), stopsOf(query.stops, lang)]);
  return (
    <I18nProvider lang={lang}>
      <TripsPage>
        <ManualTripForm initialPlace={initialPlace} initialStops={initialStops} />
      </TripsPage>
    </I18nProvider>
  );
};

export default NewTripPage;
