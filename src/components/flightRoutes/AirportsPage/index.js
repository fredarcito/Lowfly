import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ROUTES } from "@/constants/routes";

// The airports' page body (/es/flights; the photo header is AirportsHero): every airport with route pages, by
// country (the one with most airports first), each a link to its own page. `origins`: server/flightRoutes.
const AirportsPage = ({ lang, origins }) => {
  const countries = Object.values(Object.groupBy(origins, (origin) => origin.countryCode))
    .map((airports) => ({ name: airports[0].country, airports: airports.toSorted((first, second) => first.city.localeCompare(second.city, lang)) }))
    .toSorted((first, second) => second.airports.length - first.airports.length || first.name.localeCompare(second.name, lang));
  return (
    <div className="grid gap-6">
      {countries.map((country) => (
        <section key={country.name} className="grid gap-3 rounded-xl bg-card p-5 ring-1 ring-foreground/10 sm:p-6">
          <h2 className="font-heading text-xl font-bold">{country.name}</h2>
          <ul className="gap-x-8 sm:columns-2 lg:columns-3">
            {country.airports.map((origin) => (
              <li key={origin.slug} className="break-inside-avoid">
                <Link
                  href={ROUTES.flightRoute(lang, origin.slug)}
                  className="group flex items-center gap-3 border-b py-2 text-sm transition-colors hover:text-primary-ink"
                >
                  <span className="min-w-0 flex-1 truncate">{origin.city}</span>
                  <span className="text-xs text-muted-foreground tabular-nums">{origin.code}</span>
                  <ArrowRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
};

export default AirportsPage;
