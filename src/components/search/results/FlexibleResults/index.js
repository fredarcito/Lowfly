import BestPrice from "@/components/search/results/BestPrice";
import FailedNote from "@/components/search/results/FailedNote";
import TripOption from "@/components/search/results/TripOption";
import FlexMatrix from "@/components/search/results/FlexMatrix";
import Section from "@/components/search/results/Section";
import HeatLegend from "@/components/search/results/HeatLegend";
import NoResults from "@/components/search/results/NoResults";
import { useI18n } from "@/context/i18n";

const FlexibleResults = ({ data }) => {
  const { texts, format } = useI18n();
  const labels = texts.results;
  const { origin, country, city, ida, vuelta, outDays, retDays, combos, base, top, alternatives, alternativesKind, min, max, failed } = data;

  if (!top) {
    return (
      <NoResults failed={failed}>{labels.noFlightsTrip(city ?? country)}</NoResults>
    );
  }

  const plan = labels.planRange(format.fmtDay(ida), format.fmtDay(vuelta));
  let hero;
  if (!base) {
    hero = (
      <BestPrice
        price={top.total}
        label={labels.alternative}
        title={labels.noBaseTitle(plan, format.changeText(top, ida, vuelta))}
        detail={labels.topDetail(top.city)}
      />
    );
  } else if (top.total < base.total - 0.5) {
    hero = (
      <BestPrice
        price={top.total}
        label={labels.youSave(format.money(base.total - top.total))}
        title={`${format.changeText(top, ida, vuelta)}.`}
        detail={labels.planCosts(plan, format.money(base.total))}
      />
    );
  } else {
    hero = (
      <BestPrice
        price={base.total}
        label={labels.goodNews}
        title={labels.alreadyCheapest}
        detail={labels.planDetail(plan, base.city)}
      />
    );
  }

  return (
    <>
      {hero}
      <FailedNote failed={failed} />

      {base && (
        <Section title={labels.yourPlan}>
          <TripOption combo={base} ida={ida} vuelta={vuelta} origin={origin} />
        </Section>
      )}

      {alternatives.length > 0 && (
        <Section title={labels.alternatives[alternativesKind]}>
          <div className="grid gap-3">
            {alternatives.map((combo) => (
              <TripOption key={`${combo.o}|${combo.r}`} combo={combo} ida={ida} vuelta={vuelta} base={base} origin={origin} />
            ))}
          </div>
        </Section>
      )}

      <Section
        title={labels.allCombos}
        note={labels.allCombosNote}
        action={
          <HeatLegend
            min={min}
            max={max}
            extra={
              <span className="flex items-center gap-1.5">
                <span className="size-3 rounded-sm ring-2 ring-primary" aria-hidden /> {labels.yourPlan}
              </span>
            }
          />
        }
      >
        <FlexMatrix outDays={outDays} retDays={retDays} combos={combos} ida={ida} vuelta={vuelta} min={min} max={max} />
      </Section>
    </>
  );
};

export default FlexibleResults;
