import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import AirlineBadge from "@/components/shared/AirlineBadge";
import PerPersonPrice from "@/components/shared/PerPersonPrice";
import { useI18n } from "@/context/i18n";

const Leg = ({ icon: Icon, label, day, flight, href }) => {
  const { texts, format } = useI18n();
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-sm">
      <Icon className="size-4 text-muted-foreground" />
      <span className="min-w-0 basis-[calc(100%-1.75rem)] sm:flex-1 sm:basis-0">
        <span className="font-semibold">{label}</span> {format.fmtDay(day)}
        {format.at(flight.time)}
      </span>
      <AirlineBadge airline={flight.airline} className="ml-7 sm:ml-0" />
      <span className="ml-auto grid justify-items-end tabular-nums text-muted-foreground sm:ml-0">
        {format.money(format.forGroup(flight.price))}
        <PerPersonPrice price={flight.price} className="text-xs" />
      </span>
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
