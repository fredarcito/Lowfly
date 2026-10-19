import KindChips from "@/components/search/results/KindChips";
import FailedNote from "@/components/search/results/FailedNote";
import NoResults from "@/components/search/results/NoResults";
import StopoverBest from "@/components/search/results/StopoverBest";
import StopoverResults from "@/components/search/results/StopoverResults";
import AirportList from "@/components/search/results/CountryResults/components/AirportList";
import DirectBest from "@/components/search/results/CountryResults/components/DirectBest";
import DirectDates from "@/components/search/results/CountryResults/components/DirectDates";
import { useTripKind } from "@/components/search/results/CountryResults/hooks/useTripKind";
import { useI18n } from "@/context/i18n";

// The results to a country or city: the highlighted cheapest trip, the calendar, other dates and each airport for
// the direct flights; and the trips through a hub (`stopovers`, from useFlightSearch; docs/stopovers.md). Chips over
// the highlighted card switch between the kinds of trip (direct, a same-day stop, a getaway in the hub). With no
// direct flight there, `data` is null and only the trips through a hub show.
const CountryResults = ({ data, stopovers }) => {
  const { texts, format } = useI18n();
  const trips = stopovers?.data?.trips ?? [];
  const tripKind = useTripKind(data?.best ?? null, trips);
  const loadingStopovers = stopovers?.status === "loading";
  const { origin, country, city } = data ?? stopovers.data;
  // A city search (Roma) or the whole country (Italia)
  const place = city ?? country;
  const best = data?.best;
  if (!best && !trips.length && !loadingStopovers) {
    return <NoResults failed={data?.failed ?? stopovers?.data?.failed ?? []}>{texts.results.noFlightsCountry(place)}</NoResults>;
  }

  const kindOptions = tripKind.kinds.map(({ kind, fare }) => ({
    value: kind,
    label: kind === "escapada" ? texts.results.visitOnTheWay(fare.via.city) : texts.results.tripKinds[kind],
    hint: texts.results.tripKindHints[kind],
    price: format.money(fare.price, fare.cur),
  }));
  const highlighted =
    tripKind.kind === "direct" && best ? (
      <DirectBest data={data} />
    ) : (
      tripKind.shown && <StopoverBest trip={tripKind.shown} origin={origin} />
    );

  return (
    <>
      {!best && <p className="text-muted-foreground">{texts.results.noDirect(place)}</p>}
      {(kindOptions.length > 1 || loadingStopovers) && (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          {kindOptions.length > 0 && <KindChips label={texts.results.stopovers} options={kindOptions} value={tripKind.kind} onChange={tripKind.choose} />}
          {loadingStopovers && <span className="text-sm text-muted-foreground">{texts.results.stopoversLoading}</span>}
        </div>
      )}
      {highlighted}
      <FailedNote failed={[...new Set([...(data?.failed ?? []), ...(stopovers?.data?.failed ?? [])])]} />
      {best && <DirectDates data={data} />}
      {trips.length > 0 && <StopoverResults trips={trips} origin={origin} place={place} />}
      {/* With a single airport it would only repeat the highlighted trip */}
      {best && data.airports.length > 1 && <AirportList data={data} />}
    </>
  );
};

export default CountryResults;
