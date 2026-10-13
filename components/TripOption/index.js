import { ExternalLink, PlaneLanding, PlaneTakeoff } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import AirlineBadge from "@/components/AirlineBadge";
import { nightsBetween } from "@/lib/dates";
import { useI18n } from "@/components/I18nProvider";
import { capitalize } from "@/lib/format";
import { cn } from "@/lib/utils";

function Leg({ icon: Icon, label, day, flight, href }) {
  const { t, f } = useI18n();
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-sm">
      <Icon className="size-4 text-muted-foreground" />
      <span className="min-w-0 flex-1">
        <span className="font-semibold">{label}</span> {f.fmtDay(day)}
        {f.at(flight.time)}
      </span>
      <AirlineBadge airline={flight.airline} />
      <span className="tabular-nums text-muted-foreground">{f.money(flight.price)}</span>
      <Button asChild variant="outline" size="sm">
        <a href={href} target="_blank" rel="noopener noreferrer">
          {t.results.book}
          <ExternalLink />
        </a>
      </Button>
    </div>
  );
}

// An outbound + return combination, compared with the original plan
export default function TripOption({ combo: c, ida, vuelta, base, origin }) {
  const { t, f } = useI18n();
  const delta = f.deltaText(c, base);
  const diff = base ? c.total - base.total : 0;
  const nights = nightsBetween(c.o, c.r);

  return (
    <div className="grid gap-3 rounded-xl bg-card p-4 ring-1 ring-foreground/10 sm:p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="grid gap-1.5">
          <p className="font-heading text-base font-semibold">{f.changeText(c, ida, vuelta)}</p>
          <p className="text-sm text-muted-foreground">
            {t.results.nightsIn(nights, `${c.city} (${c.code})`)}
          </p>
        </div>
        <div className="grid justify-items-end gap-1.5">
          <span className="font-heading text-2xl font-extrabold tabular-nums">{f.money(c.total)}</span>
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
        <Leg icon={PlaneTakeoff} label={t.results.out} day={c.o} flight={c.out} href={f.bookUrl(c.out.airline, origin, c.code, c.o)} />
        <Leg icon={PlaneLanding} label={t.results.ret} day={c.r} flight={c.ret} href={f.bookUrl(c.ret.airline, c.code, origin, c.r)} />
      </div>
    </div>
  );
}
