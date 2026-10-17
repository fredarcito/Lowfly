import { Map as MapIcon, Plane, Sparkles } from "lucide-react";
import { adminTexts } from "@/components/admin/data/texts";
import { adminFormat } from "@/components/admin/data/format";

// One thing an account did, with its date and time: a trip it saved (marked when it was deleted later) or an
// itinerary it made (its towns, days and what the AI cost). `event`: one of server/admin/users's history.
const ActivityItem = ({ event, lang }) => {
  const texts = adminTexts(lang).user.history;
  const formats = adminFormat(lang);
  const Icon = event.type === "itinerary" ? Sparkles : event.manual ? MapIcon : Plane;
  return (
    <li className="flex gap-3 py-3 first:pt-0 last:pb-0">
      <span aria-hidden className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-lg bg-muted">
        <Icon className="size-4 text-muted-foreground" />
      </span>
      <div className="grid min-w-0 flex-1 gap-0.5 text-sm">
        <p className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className="font-medium">
            {event.type === "itinerary"
              ? texts.itinerary(event.cities.join(" → "), event.days)
              : event.manual
                ? texts.manualTrip(event.destination)
                : texts.flight(event.destination)}
          </span>
          {event.deleted && <span className="rounded-full border px-2 py-0.5 text-xs text-muted-foreground">{texts.deleted}</span>}
        </p>
        <p className="text-muted-foreground tabular-nums">
          {formats.date(event.at, true)}
          {event.type === "itinerary" && ` · ${formats.money(event.cost)}`}
        </p>
      </div>
    </li>
  );
};

export default ActivityItem;
