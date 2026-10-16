import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { routeTexts } from "@/components/flightRoutes/data/texts";
import { REGION_ORDER } from "@/server/flightRoutes/regions";
import { ROUTES } from "@/constants/routes";

// Destinations from one airport as columns by region (Southern Europe, Western Europe…), each a link to its route
// page, with its lowest price when known. `routes`: server/flightRoutes; `prices`: { slug: written price };
// `limit`: at most this many per region (a route's page shows a few; the airport's page, all).
const DestinationColumns = ({ lang, routes, prices = {}, limit = Infinity }) => {
  const texts = routeTexts(lang);
  const regions = REGION_ORDER.map((region) => ({ region, routes: routes.filter((route) => route.region === region).slice(0, limit) })).filter(
    (group) => group.routes.length
  );
  return (
    // Newspaper columns: the regions flow from one column to the next and the browser evens their heights (a grid
    // would leave rows as tall as their longest region, with gaps under the short ones); a region never splits
    <div className="gap-x-8 sm:columns-2 lg:columns-3">
      {regions.map((group) => (
        <div key={group.region} className="mb-6 grid break-inside-avoid content-start gap-2 last:mb-0">
          <h3 className="font-semibold">{texts.regions[group.region]}</h3>
          <ul className="grid">
            {group.routes.map((route) => (
              <li key={route.slug}>
                <Link
                  href={ROUTES.flightRoute(lang, route.slug)}
                  className="group flex items-center gap-3 border-b py-2 text-sm transition-colors hover:text-primary-ink"
                >
                  <span className="min-w-0 flex-1 truncate">{route.city}</span>
                  {prices[route.slug] && <span className="text-muted-foreground tabular-nums">{prices[route.slug]}</span>}
                  <ArrowRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
};

export default DestinationColumns;
