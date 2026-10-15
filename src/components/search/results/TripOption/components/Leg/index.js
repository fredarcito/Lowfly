import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import AirlineBadge from "@/components/shared/AirlineBadge";
import { useI18n } from "@/context/i18n";

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

export default Leg;
