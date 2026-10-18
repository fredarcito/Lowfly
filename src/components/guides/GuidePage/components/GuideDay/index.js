import { Coffee, TrainFront, UtensilsCrossed } from "lucide-react";
import ItineraryMap from "@/components/shared/ItineraryMap";
import { guideTexts } from "@/components/guides/data/texts";
import { dayPlan } from "@/utils/itinerary";
import { cn } from "@/utils/cn";

const SIGHTS = new Set(["imprescindible", "recomendado", "opcional"]);

// A meal's or a move's icon (sights carry their number, as on the map)
const iconOf = (stop) => {
  if (stop.type === "comida") return Number(stop.time?.slice(0, 2)) < 11 ? Coffee : UtensilsCrossed;
  return TrainFront;
};

// One day of a guide: its title, then its stops (what each sight is worth, where to eat) next to a miniature of the
// city with the day's pins (above them on phones, as in the app). Lighter than the app's day: what to order, the
// history and the map to move around and tap are the reader's own itinerary's.
const GuideDay = ({ lang, day, number }) => {
  const texts = guideTexts(lang);
  const { stops, mapStops } = dayPlan(day);
  return (
    <section aria-labelledby={`${day.date}-title`} className="grid gap-4">
      <div className="grid gap-1">
        <p className="text-sm font-semibold text-primary-ink">{texts.day(number)}</p>
        <h2 id={`${day.date}-title`} className="font-heading text-2xl font-extrabold tracking-tight sm:text-3xl">
          {day.title}
        </h2>
        <p className="text-sm text-muted-foreground">{texts.stops(stops.length)}</p>
      </div>
      <div className={cn("grid items-start gap-4", mapStops.length > 0 && "lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]")}>
        {mapStops.length > 0 && (
          <figure className="grid gap-2 lg:sticky lg:top-20 lg:order-last">
            <ItineraryMap
              stops={mapStops}
              interactive={false}
              className="relative isolate z-0 h-64 overflow-hidden rounded-xl ring-1 ring-foreground/10 sm:h-80"
            />
            <figcaption className="text-xs text-muted-foreground">{texts.mapNote}</figcaption>
          </figure>
        )}
        <ol className="overflow-hidden rounded-xl bg-card py-1 ring-1 ring-foreground/10">
          {stops.map((stop) => {
            const Icon = iconOf(stop);
            const sight = SIGHTS.has(stop.type);
            return (
              <li key={stop.id} className="flex gap-3 border-b px-4 py-3.5 last:border-b-0 sm:px-5">
                {stop.number ? (
                  <span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                    {stop.number}
                  </span>
                ) : (
                  <span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-full bg-muted text-muted-foreground">
                    <Icon className="size-3.5" />
                  </span>
                )}
                <div className="grid min-w-0 gap-1">
                  <p className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                    <span className="text-sm text-muted-foreground tabular-nums">{stop.time}</span>
                    <span className="font-semibold">{stop.title}</span>
                    {sight && texts.types[stop.type] && (
                      <span
                        className={cn(
                          "rounded-full px-2 py-0.5 text-xs font-medium",
                          stop.type === "imprescindible" ? "bg-primary/12 text-primary-ink" : "bg-muted text-muted-foreground"
                        )}
                      >
                        {texts.types[stop.type]}
                      </span>
                    )}
                  </p>
                  {sight && stop.why && <p className="text-sm leading-relaxed text-muted-foreground">{stop.why}</p>}
                  {stop.type === "comida" && stop.food && <p className="text-sm text-muted-foreground">{stop.food}</p>}
                  {sight && stop.note && <p className="text-sm text-muted-foreground/80 italic">{stop.note}</p>}
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
};

export default GuideDay;
