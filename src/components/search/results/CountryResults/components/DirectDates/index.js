import ResultList from "@/components/search/results/ResultList";
import ResultRow from "@/components/search/results/ResultRow";
import PriceCalendar from "@/components/search/results/PriceCalendar";
import Section from "@/components/search/results/Section";
import HeatLegend from "@/components/search/results/HeatLegend";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMonthPages } from "@/components/search/results/CountryResults/components/DirectDates/hooks/useMonthPages";
import { useI18n } from "@/context/i18n";
import { airlinesOf } from "@/utils/format";

// The direct flights by day: the price calendar (two months at once, one on phones, with arrows when the search
// spans more) and the next cheapest dates
const DirectDates = ({ data }) => {
  const { texts, format } = useI18n();
  const { origin, roundTrip, country, city, from, to, months, byDay, best, others, min, max } = data;
  const pages = useMonthPages(months, best.day);
  const priceNote = roundTrip ? texts.results.roundTrip : undefined;
  const place = city ?? country;
  return (
    <>
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
        <div className="relative grid gap-6 rounded-xl bg-card p-4 ring-1 ring-foreground/10 sm:p-5 md:grid-cols-2">
          {pages.paged && (
            <div className="absolute top-3 right-3 flex gap-1 sm:top-4 sm:right-4">
              <Button variant="ghost" size="icon" className="size-8" onClick={pages.back} disabled={!pages.canBack} aria-label={texts.results.previousMonths}>
                <ChevronLeft />
              </Button>
              <Button variant="ghost" size="icon" className="size-8" onClick={pages.forward} disabled={!pages.canForward} aria-label={texts.results.nextMonths}>
                <ChevronRight />
              </Button>
            </div>
          )}
          {pages.shown.map((month) => (
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
    </>
  );
};

export default DirectDates;
