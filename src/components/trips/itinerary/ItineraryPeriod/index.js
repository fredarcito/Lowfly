import { Moon, Sun, Sunrise } from "lucide-react";
import ItineraryTimeline from "@/components/trips/itinerary/ItineraryTimeline";
import { useI18n } from "@/context/i18n";

const PERIOD_ICONS = { morning: Sunrise, afternoon: Sun, night: Moon };

// Start of a part of the day: its icon sits on the timeline, then the name and a rule across the list
const ItineraryPeriod = ({ period, lineAbove, lineBelow }) => {
  const { t } = useI18n();
  const Icon = PERIOD_ICONS[period];
  return (
    <li className="relative grid grid-cols-[2.25rem_minmax(0,1fr)] items-center gap-x-3 px-3 py-3 sm:px-4">
      <ItineraryTimeline above={lineAbove} below={lineBelow} />
      <span className="relative z-10 grid size-9 place-items-center rounded-full bg-muted text-foreground ring-4 ring-card">
        <Icon className="size-4" />
      </span>
      <span className="flex items-center gap-3">
        <span className="font-heading text-sm font-bold tracking-wide uppercase">{t.trips.periods[period]}</span>
        <span aria-hidden className="h-px flex-1 bg-border" />
      </span>
    </li>
  );
};

export default ItineraryPeriod;
