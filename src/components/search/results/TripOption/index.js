import { PlaneLanding, PlaneTakeoff } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { nightsBetween } from "@/utils/dates";
import { useI18n } from "@/context/i18n";
import { capitalize } from "@/utils/format";
import { cn } from "@/utils/cn";
import Leg from "@/components/search/results/TripOption/components/Leg";
import PerPersonPrice from "@/components/shared/PerPersonPrice";

// An outbound + return combination, compared with the original plan
const TripOption = ({ combo: combo, ida, vuelta, base, origin }) => {
  const { texts, format } = useI18n();
  const delta = format.deltaText(combo, base);
  const diff = base ? combo.total - base.total : 0;
  const nights = nightsBetween(combo.o, combo.r);

  return (
    <div className="grid gap-3 rounded-xl bg-card p-4 ring-1 ring-foreground/10 sm:p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="grid gap-1.5">
          <p className="font-heading text-base font-semibold">{format.changeText(combo, ida, vuelta)}</p>
          <p className="text-sm text-muted-foreground">
            {texts.results.nightsIn(nights, `${combo.city} (${combo.code})`)}
          </p>
        </div>
        <div className="grid justify-items-end gap-1.5">
          <span className="font-heading text-2xl font-extrabold tabular-nums">{format.money(format.forGroup(combo.total))}</span>
          <PerPersonPrice price={combo.total} className="text-xs" />
          {delta && (
            <Badge
              variant="secondary"
              className={cn(diff < -0.5 && "bg-save/15 text-save", diff > 0.5 && "text-muted-foreground")}
            >
              {capitalize(delta)}
            </Badge>
          )}
        </div>
      </div>
      <div className="grid gap-2 border-t pt-3">
        <Leg icon={PlaneTakeoff} label={texts.results.out} day={combo.o} flight={combo.out} href={format.bookUrl(combo.out.airline, origin, combo.code, combo.o)} />
        <Leg icon={PlaneLanding} label={texts.results.ret} day={combo.r} flight={combo.ret} href={format.bookUrl(combo.ret.airline, combo.code, origin, combo.r)} />
      </div>
    </div>
  );
};

export default TripOption;
