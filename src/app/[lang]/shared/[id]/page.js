import SharedTrip from "@/components/trips/sharing/SharedTrip";
import SharedTripGone from "@/components/trips/sharing/SharedTripGone";
import TripsPage from "@/components/trips/TripsPage";
import { I18nProvider } from "@/providers/I18nProvider";
import { APP_NAME, getDictionary } from "@/i18n";
import { getSharedTrip } from "@/server/sharedTrips";

// Any share id reaches the page (the language above only allows /es and /en); each request reads the trip
// as it is now, so the owner's changes show at once
export const dynamicParams = true;
export const dynamic = "force-dynamic";

export const generateMetadata = async ({ params }) => {
  const { lang, id } = await params;
  const texts = getDictionary(lang);
  const shared = await getSharedTrip(id);
  // Personal pages: reachable by link only, never in search engines
  const robots = { index: false, follow: false };
  if (!shared) return { title: `${texts.share.goneTitle} · ${APP_NAME}`, robots };
  const { fare } = shared.trip;
  const title = `${texts.share.metaTitle(fare.city, fare.ret && texts.units.nights(fare.nights))} · ${APP_NAME}`;
  const description = texts.share.metaText(shared.owner.name);
  return { title, description, robots, openGraph: { title, description }, twitter: { title, description } };
};

// A trip someone shared (/es/shared/<id>): read only, for anyone with the link, signed in or not
const SharedTripPage = async ({ params }) => {
  const { lang, id } = await params;
  const shared = await getSharedTrip(id);
  return (
    <I18nProvider lang={lang}>
      {shared ? (
        <SharedTrip trip={shared.trip} owner={shared.owner} />
      ) : (
        <TripsPage>
          <SharedTripGone />
        </TripsPage>
      )}
    </I18nProvider>
  );
};

export default SharedTripPage;
