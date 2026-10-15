import { ExternalLink, PlaneLanding, PlaneTakeoff } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import AirlineBadge from "@/components/shared/AirlineBadge";
import { nightsBetween } from "@/utils/dates";
import { useI18n } from "@/context/i18n";
import { capitalize } from "@/utils/format";
import { cn } from "@/utils/cn";

const Leg = ({ icon: Icon, label, day, flight, href }) => {
  const { texts, format } = useI18n();
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-sm">
      <Icon className="size-4 text-muted-foreground" />
      <span className="min-w-0 flex-1">
        <span className="font-semibold">{label}</span> {format.fmtDay(day)}
        {format.at(flight.time)}
      </span>
      <AirlineBadge airline={flight.airline} />
      <span className="tabular-nums text-muted-foreground">{format.money(flight.price)}</span>
      <Button asChild variant="outline" size="sm">
        <a href={href} target="_blank" rel="noopener noreferrer">
          {texts.results.book}
          <ExternalLink />
        </a>
      </Button>
    </div>
  );
};

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
          <span className="font-heading text-2xl font-extrabold tabular-nums">{format.money(combo.total)}</span>
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
