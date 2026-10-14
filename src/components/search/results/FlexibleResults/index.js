import BestPrice from "@/components/search/results/BestPrice";
import FailedNote from "@/components/search/results/FailedNote";
import TripOption from "@/components/search/results/TripOption";
import FlexMatrix from "@/components/search/results/FlexMatrix";
import Section from "@/components/search/results/Section";
import HeatLegend from "@/components/search/results/HeatLegend";
import NoResults from "@/components/search/results/NoResults";
import { useI18n } from "@/context/i18n";

const FlexibleResults = ({ data }) => {
  const { t, f } = useI18n();
  const r = t.results;
  const { origin, country, city, ida, vuelta, outDays, retDays, combos, base, top, alternatives, alternativesKind, min, max, failed } = data;

  if (!top) {
    return (
      <NoResults failed={failed}>{r.noFlightsTrip(city ?? country)}</NoResults>
    );
  }

  const plan = r.planRange(f.fmtDay(ida), f.fmtDay(vuelta));
  let hero;
  if (!base) {
    hero = (
      <BestPrice
        price={top.total}
        label={r.alternative}
        title={r.noBaseTitle(plan, f.changeText(top, ida, vuelta))}
        detail={r.topDetail(top.city)}
      />
    );
  } else if (top.total < base.total - 0.5) {
    hero = (
      <BestPrice
        price={top.total}
        label={r.youSave(f.money(base.total - top.total))}
        title={`${f.changeText(top, ida, vuelta)}.`}
        detail={r.planCosts(plan, f.money(base.total))}
      />
    );
  } else {
    hero = (
      <BestPrice
        price={base.total}
        label={r.goodNews}
        title={r.alreadyCheapest}
        detail={r.planDetail(plan, base.city)}
      />
    );
  }

  return (
    <>
      {hero}
      <FailedNote failed={failed} />

      {base && (
        <Section title={r.yourPlan}>
          <TripOption combo={base} ida={ida} vuelta={vuelta} origin={origin} />
        </Section>
      )}

      {alternatives.length > 0 && (
        <Section title={r.alternatives[alternativesKind]}>
          <div className="grid gap-3">
            {alternatives.map((c) => (
              <TripOption key={`${c.o}|${c.r}`} combo={c} ida={ida} vuelta={vuelta} base={base} origin={origin} />
            ))}
          </div>
        </Section>
      )}

      <Section
        title={r.allCombos}
        note={r.allCombosNote}
        action={
          <HeatLegend
            min={min}
            max={max}
            extra={
              <span className="flex items-center gap-1.5">
                <span className="size-3 rounded-sm ring-2 ring-primary" aria-hidden /> {r.yourPlan}
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
