import BestPrice from "@/components/BestPrice";
import ResultRow, { ResultList } from "@/components/ResultRow";
import FailedNote from "@/components/FailedNote";
import PriceCalendar from "@/components/PriceCalendar";
import Section from "@/components/Section";
import HeatLegend from "@/components/HeatLegend";
import NoResults from "@/components/NoResults";
import { useI18n } from "@/components/I18nProvider";
import { airlinesOf } from "@/lib/format";

export default function CountryResults({ data }) {
  const { t, f: fmt } = useI18n();
  const { origin, roundTrip, country, from, to, months, byDay, best, others, airports, min, max, failed } = data;
  const priceNote = roundTrip ? t.results.roundTrip : undefined;
  if (!best) {
    return (
      <NoResults failed={failed}>{t.results.noFlightsCountry(country)}</NoResults>
    );
  }

  return (
    <>
      <BestPrice
        price={best.price}
        cur={best.cur}
        title={`${best.city}, ${country}`}
        detail={t.results.airportAdult(best.code)}
        links={fmt.fareLinks(best, origin)}
        fare={{ ...best, country }}
        origin={origin}
        priceNote={priceNote}
        label={t.results.bestDay}
      />
      <FailedNote failed={failed} />

      <Section
        title={t.results.calendar}
        note={roundTrip ? t.results.calendarNoteReturn(country) : t.results.calendarNoteOneway(country)}
        action={
          <HeatLegend
            min={min}
            max={max}
            extra={
              <span className="flex items-center gap-1.5">
                <span className="size-3 rounded-sm ring-2 ring-primary" aria-hidden /> {t.results.bestDayLegend}
              </span>
            }
          />
        }
      >
        <div className="grid gap-6 rounded-xl bg-card p-4 ring-1 ring-foreground/10 sm:p-5 md:grid-cols-2">
          {months.map((m) => (
            <PriceCalendar key={m} month={m} byDay={byDay} min={min} max={max} bestDay={best.day} from={from} to={to} origin={origin} />
          ))}
        </div>
      </Section>

      {others.length > 0 && (
        <Section title={t.results.otherDates}>
          <ResultList>
            {others.map((f) => (
              <ResultRow
                key={f.day}
                href={fmt.fareLinks(f, origin)[0].href}
                title={f.ret ? fmt.fareDates(f) : fmt.fmtDay(f.day)}
                meta={f.ret ? `${f.city} (${f.code})` : `${f.city} (${f.code})${fmt.at(f.time)}`}
                airlines={airlinesOf(f)}
                priceNote={priceNote}
                price={f.price}
                cur={f.cur}
              />
            ))}
          </ResultList>
        </Section>
      )}

      <Section title={t.results.byAirport} note={roundTrip ? t.results.byAirportNoteReturn : t.results.byAirportNoteOneway}>
        <ResultList>
          {airports.map((f) => (
            <ResultRow
              key={f.code}
              href={fmt.fareLinks(f, origin)[0].href}
              title={`${f.city} (${f.code})`}
              meta={f.ret ? fmt.fareDates(f) : t.results.bestDayMeta(fmt.fmtDay(f.day))}
              airlines={airlinesOf(f)}
              priceNote={priceNote}
              price={f.price}
              cur={f.cur}
            />
          ))}
        </ResultList>
      </Section>
    </>
  );
}
