import Link from "next/link";
import { ArrowRight, Route } from "lucide-react";
import { routePageTexts } from "@/components/multiCity/data/texts";
import { ROUTES } from "@/constants/routes";
import { LOCALE_TAGS } from "@/i18n";

// "Venecia forma parte del recorrido Italia clásica": a route's page, from a guide to one of its towns (as a route's
// flight page links to the city's guide), quiet so the guide's own button stays the one in colour. `route`:
// server/multiCity/pages routePagesWithGuide.
const RouteLink = ({ lang, city, route }) => {
  const texts = routePageTexts(lang).guideLink;
  const towns = new Intl.ListFormat(LOCALE_TAGS[lang], { style: "long", type: "conjunction" }).format(route.towns);
  return (
    <Link
      href={ROUTES.multiCityRoute(lang, route.slug)}
      className="group flex items-center gap-3 rounded-xl bg-card p-5 ring-1 ring-foreground/10 transition hover:ring-primary/50 sm:p-6"
    >
      <Route className="size-6 shrink-0 text-primary" />
      <span className="grid flex-1 gap-0.5">
        <span className="font-heading text-lg font-bold">{texts.title(city, route.name)}</span>
        <span className="text-sm text-muted-foreground">{texts.text(towns, route.days.min, route.days.max)}</span>
      </span>
      <ArrowRight className="size-5 shrink-0 text-primary transition group-hover:translate-x-1" />
    </Link>
  );
};

export default RouteLink;
