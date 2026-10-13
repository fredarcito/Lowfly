import { Moon, Plane, PlaneLanding, PlaneTakeoff } from "lucide-react";
import AirlineBadge from "@/components/AirlineBadge";
import { useI18n } from "@/components/I18nProvider";

// One leg: departure → arrival time and airport, airline and the price of that leg
function Leg({ icon: Icon, label, flight, from, to }) {
  const { f } = useI18n();
  return (
    <div className="grid gap-2 sm:grid-cols-[7rem_1fr_auto] sm:items-center sm:gap-4">
      <div className="flex items-center gap-2 sm:grid sm:gap-0.5">
        <span className="flex items-center gap-1.5 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
          <Icon className="size-3.5" /> {label}
        </span>
        <span className="text-sm font-medium first-letter:uppercase">{f.fmtDay(flight.day)}</span>
      </div>

      <div className="flex items-center gap-3">
        <div className="grid">
          <span className="font-heading text-xl font-bold tabular-nums">{flight.time || "—"}</span>
          <span className="text-xs font-semibold tracking-wider text-muted-foreground">{from}</span>
        </div>
        <div className="flex flex-1 items-center gap-1 text-muted-foreground" aria-hidden>
          <span className="h-px flex-1 border-t border-dashed border-current" />
          <Plane className="size-3.5 rotate-45" />
          <span className="h-px flex-1 border-t border-dashed border-current" />
        </div>
        <div className="grid text-right">
          <span className="font-heading text-xl font-bold tabular-nums">{flight.arrive || "—"}</span>
          <span className="text-xs font-semibold tracking-wider text-muted-foreground">{to}</span>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 sm:justify-end">
        <AirlineBadge airline={flight.airline} />
        <span className="min-w-20 text-right font-heading text-lg font-bold tabular-nums">{f.money(flight.price, flight.cur)}</span>
      </div>
    </div>
  );
}

// Fare details: the outbound flight and, for a return trip, the stay and the return flight
export default function FareLegs({ fare, origin }) {
  const { t } = useI18n();
  const out = fare.out || fare;
  return (
    <div className="grid gap-3 rounded-lg bg-muted/50 p-4">
      <Leg icon={PlaneTakeoff} label={t.results.out} flight={out} from={origin} to={fare.code} />
      {fare.ret && (
        <>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="h-px flex-1 bg-border" />
            <span className="flex items-center gap-1.5">
              <Moon className="size-3.5" />
              {t.results.nightsIn(fare.nights, fare.city)}
            </span>
            <span className="h-px flex-1 bg-border" />
          </div>
          <Leg icon={PlaneLanding} label={t.results.ret} flight={fare.ret} from={fare.code} to={origin} />
        </>
      )}
    </div>
  );
}
