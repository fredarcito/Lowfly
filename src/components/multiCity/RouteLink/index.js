import Link from "next/link";
import { ArrowRight, Route } from "lucide-react";
import { routePageTexts } from "@/components/multiCity/data/texts";
import { ROUTES } from "@/constants/routes";
import { LOCALE_TAGS } from "@/i18n";

// "Venecia forma parte del recorrido Italia clásica": a route's page, from a guide to one of its towns (as a route's
// flight page links to the city's guide), quiet so the guide's own button stays the one in colour. One line and no
// card: the icon, the route's name with its towns under it in grey, and "Ver el recorrido" at the end, with a hairline
// on the left as tall as the line. `route`: server/multiCity/pages routePagesWithGuide.
const RouteLink = ({ lang, city, route }) => {
  const texts = routePageTexts(lang).guideLink;
  const towns = new Intl.ListFormat(LOCALE_TAGS[lang], { style: "long", type: "conjunction" }).format(route.towns);
  return (
    <Link
      href={ROUTES.multiCityRoute(lang, route.slug)}
      className="group flex items-center gap-3 self-start border-l-2 border-primary/30 py-1 pl-4 transition hover:border-primary"
    >
      <Route className="size-4 shrink-0 text-primary" />
      <span className="grid min-w-0 flex-1 gap-0.5">
        <span className="truncate text-sm font-semibold">{texts.title(city, route.name)}</span>
        <span className="flex min-w-0 flex-wrap items-baseline gap-x-2 gap-y-0.5">
          <span className="truncate text-xs text-muted-foreground">{texts.text(towns, route.days.min, route.days.max)}</span>
          <span className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-primary-ink underline-offset-4 group-hover:underline">
            {texts.action}
            <ArrowRight className="size-3.5 transition group-hover:translate-x-0.5" />
          </span>
        </span>
      </span>
    </Link>
  );
};

export default RouteLink;
