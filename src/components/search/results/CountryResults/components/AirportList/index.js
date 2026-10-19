import ResultList from "@/components/search/results/ResultList";
import ResultRow from "@/components/search/results/ResultRow";
import Section from "@/components/search/results/Section";
import { useI18n } from "@/context/i18n";
import { airlinesOf } from "@/utils/format";

// The cheapest direct flight to each airport of the place searched
const AirportList = ({ data }) => {
  const { texts, format } = useI18n();
  const { origin, roundTrip, country, airports } = data;
  const priceNote = roundTrip ? texts.results.roundTrip : undefined;
  return (
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
  );
};

export default AirportList;
