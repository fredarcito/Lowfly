import Link from "next/link";
import { ArrowRight, Check, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { routeTexts } from "@/components/flightRoutes/data/texts";
import { ROUTES } from "@/constants/routes";

// "Planning your trip?": what the itinerary brings, and "Create itinerary", which opens the trip planner with the
// destination already its first town (only the dates to choose)
const PlanCard = ({ lang, route }) => {
  const texts = routeTexts(lang).plan;
  return (
    <section className="grid content-start gap-4 rounded-xl bg-card p-5 ring-1 ring-foreground/10 sm:p-6">
      <div className="flex gap-3">
        <Sparkles className="mt-1 size-6 shrink-0 text-primary" />
        <div className="grid gap-0.5">
          <h2 className="font-heading text-xl font-bold">{texts.title}</h2>
          <p className="text-sm text-muted-foreground">{texts.subtitle(route.city)}</p>
        </div>
      </div>
      <ul className="grid gap-2 text-sm">
        {texts.points.map((point) => (
          <li key={point} className="flex items-center gap-2.5">
            <span className="grid size-5 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground">
              <Check className="size-3" strokeWidth={3} />
            </span>
            {point}
          </li>
        ))}
      </ul>
      <Button asChild className="h-11 font-bold">
        <Link href={ROUTES.newTrip(lang, route.airports[0].code)}>
          {texts.button} <ArrowRight />
        </Link>
      </Button>
    </section>
  );
};

export default PlanCard;
