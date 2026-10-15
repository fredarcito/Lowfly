import BestPrice from "@/components/search/results/BestPrice";
import ResultList from "@/components/search/results/ResultList";
import ResultRow from "@/components/search/results/ResultRow";
import FailedNote from "@/components/search/results/FailedNote";
import PriceCalendar from "@/components/search/results/PriceCalendar";
import Section from "@/components/search/results/Section";
import HeatLegend from "@/components/search/results/HeatLegend";
import NoResults from "@/components/search/results/NoResults";
import { useI18n } from "@/context/i18n";
import { airlinesOf } from "@/utils/format";

const CountryResults = ({ data }) => {
  const { texts, format } = useI18n();
  const { origin, roundTrip, country, city, from, to, months, byDay, best, others, airports, min, max, failed } = data;
  const priceNote = roundTrip ? texts.results.roundTrip : undefined;
  // A city search (Roma) or the whole country (Italia)
  const place = city ?? country;
  if (!best) {
    return (
      <NoResults failed={failed}>{texts.results.noFlightsCountry(place)}</NoResults>
    );
  }

  return (
    <>
      <BestPrice
        price={best.price}
        cur={best.cur}
        title={`${best.city}, ${country}`}
        detail={texts.results.airportAdult(best.code)}
        links={format.fareLinks(best, origin)}
        fare={{ ...best, country }}
        origin={origin}
        priceNote={priceNote}
        label={texts.results.bestDay}
      />
      <FailedNote failed={failed} />

      <Section
        title={texts.results.calendar}
        note={roundTrip ? texts.results.calendarNoteReturn(place) : texts.results.calendarNoteOneway(place)}
        action={
          <HeatLegend
            min={min}
            max={max}
            extra={
              <span className="flex items-center gap-1.5">
                <span className="size-3 rounded-sm ring-2 ring-primary" aria-hidden /> {texts.results.bestDayLegend}
              </span>
            }
          />
        }
      >
        <div className="grid gap-6 rounded-xl bg-card p-4 ring-1 ring-foreground/10 sm:p-5 md:grid-cols-2">
          {months.map((month) => (
            <PriceCalendar key={month} month={month} byDay={byDay} min={min} max={max} bestDay={best.day} from={from} to={to} origin={origin} />
          ))}
        </div>
      </Section>

      {others.length > 0 && (
        <Section title={texts.results.otherDates}>
          <ResultList>
            {others.map((fare) => (
              <ResultRow
                key={fare.day}
                title={fare.ret ? format.fareDates(fare) : format.fmtDay(fare.day)}
                meta={fare.ret ? `${fare.city} (${fare.code})` : `${fare.city} (${fare.code})${format.at(fare.time)}`}
                airlines={airlinesOf(fare)}
                priceNote={priceNote}
                fare={{ ...fare, country: fare.country ?? country }}
                origin={origin}
              />
            ))}
          </ResultList>
        </Section>
      )}

      <Section title={texts.results.byAirport} note={roundTrip ? texts.results.byAirportNoteReturn : texts.results.byAirportNoteOneway}>
        <ResultList>
          {airports.map((fare) => (
            <ResultRow
              key={fare.code}
              title={`${fare.city} (${fare.code})`}
              meta={fare.ret ? format.fareDates(fare) : texts.results.bestDayMeta(format.fmtDay(fare.day))}
              airlines={airlinesOf(fare)}
              priceNote={priceNote}
              fare={{ ...fare, country: fare.country ?? country }}
              origin={origin}
            />
          ))}
        </ResultList>
      </Section>
    </>
  );
};

export default CountryResults;
