import BestPrice from "@/components/search/results/BestPrice";
import { useI18n } from "@/context/i18n";

// The highlighted direct flight: the cheapest day of the search
const DirectBest = ({ data }) => {
  const { texts, format } = useI18n();
  const { origin, roundTrip, country, best } = data;
  return (
    <BestPrice
      price={best.price}
      cur={best.cur}
      title={`${best.city}, ${country}`}
      detail={texts.results.airportAdult(best.code)}
      links={format.fareLinks(best, origin)}
      fare={{ ...best, country }}
      origin={origin}
      priceNote={roundTrip ? texts.results.roundTrip : undefined}
      label={texts.results.bestDay}
    />
  );
};

export default DirectBest;
