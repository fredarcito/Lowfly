import { Coffee, TrainFront, UtensilsCrossed } from "lucide-react";
import { guideTexts } from "@/components/guides/data/texts";
import { visitLength } from "@/components/guides/GuidePage/components/GuideDay/utils/visitLength";
import { cn } from "@/utils/cn";

const SIGHTS = new Set(["imprescindible", "recomendado", "opcional"]);

// A meal's or a move's icon (sights carry their number, in the order they are visited)
const iconOf = (stop) => {
  if (stop.type === "comida") return Number(stop.time?.slice(0, 2)) < 11 ? Coffee : UtensilsCrossed;
  return TrainFront;
};

// One day of a guide (its section is #day-1, the days' links' target): its title, then its stops, what each sight
// is worth, how long it takes and what to look for there, and where to eat, at the hour each starts (a rough one: the
// times are a guide). Lighter than the app's day: what to order, the history and the map are the reader's own itinerary's. `children`: the foot of its card, part of
// the day (a "make it yours" prompt, TailorPrompt: a reader who jumps to the day meets it at its end).
const GuideDay = ({ lang, day, number, children }) => {
  const texts = guideTexts(lang);
  const { stops } = day;
  let sightCount = 0;
  return (
    <section id={day.date} aria-labelledby={`${day.date}-title`} className="grid scroll-mt-20 gap-4">
      <div className="grid gap-1">
        <p className="text-sm font-semibold text-primary-ink">{texts.day(number)}</p>
        <h2 id={`${day.date}-title`} className="font-heading text-2xl font-extrabold tracking-tight sm:text-3xl">
          {day.title}
        </h2>
        <p className="text-sm text-muted-foreground">
          {texts.stops(stops.length)} · {texts.roughTimes}
        </p>
      </div>
      <div className="overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10">
      <ol>
        {stops.map((stop, index) => {
          const Icon = iconOf(stop);
          const sight = SIGHTS.has(stop.type);
          const number = sight ? ++sightCount : null;
          // Only when it starts ("09:00", not "09:00–10:30"): easier to read, and a rough hour anyway
          const time = stop.time?.match(/\d{1,2}:\d{2}/)?.[0];
          const length = sight ? visitLength(stop.time) : null;
          return (
            <li
              key={`${day.date}-${index}`}
              className="grid grid-cols-[2.25rem_minmax(0,1fr)] gap-x-3 border-b px-4 py-4 last:border-b-0 sm:grid-cols-[2.5rem_3.25rem_minmax(0,1fr)] sm:gap-x-4 sm:px-5"
            >
              {number ? (
                <span className="grid size-9 place-items-center rounded-full bg-primary text-sm font-bold text-primary-foreground sm:size-10">{number}</span>
              ) : (
                <span className="grid size-9 place-items-center rounded-full bg-muted text-muted-foreground sm:size-10">
                  <Icon className="size-4" />
                </span>
              )}
              {/* Its own column from tablets up, as in a diary; on phones above the title */}
              <span className="pt-0.5 text-sm text-muted-foreground tabular-nums max-sm:hidden">{time}</span>
              <div className="grid min-w-0 gap-1">
                <p className="flex flex-wrap items-baseline gap-x-2.5 gap-y-0.5">
                  <span className="text-sm text-muted-foreground tabular-nums sm:hidden">{time}</span>
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
                  {length && <span className="text-xs text-muted-foreground">{texts.visitLength(length)}</span>}
                </p>
                {sight && stop.why && <p className="text-sm leading-relaxed text-muted-foreground">{stop.why}</p>}
                {sight && stop.lookFor && (
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    <span className="font-medium text-foreground">{texts.lookFor}:</span> {stop.lookFor}
                  </p>
                )}
                {stop.type === "comida" && stop.food && <p className="text-sm text-muted-foreground">{stop.food}</p>}
                {sight && stop.note && <p className="text-sm text-muted-foreground/80 italic">{stop.note}</p>}
              </div>
            </li>
          );
        })}
      </ol>
      {children}
      </div>
    </section>
  );
};

export default GuideDay;
