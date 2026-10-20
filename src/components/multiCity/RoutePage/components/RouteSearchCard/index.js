import { Check, Plane } from "lucide-react";
import RouteSearchLink from "@/components/multiCity/RoutePage/components/RouteSearchLink";
import { routePageTexts } from "@/components/multiCity/data/texts";
import { ROUTES } from "@/constants/routes";

// The end of a route's page: what the "Recorridos" search brings (real flights for the reader's free days), and
// the way there
const RouteSearchCard = ({ lang, route }) => {
  const texts = routePageTexts(lang).card;
  return (
    <section className="grid gap-4 rounded-xl bg-card p-5 ring-1 ring-foreground/10 sm:p-6">
      <div className="flex gap-3">
        <Plane className="mt-1 size-6 shrink-0 text-primary" />
        <div className="grid gap-0.5">
          <h2 className="font-heading text-xl font-bold sm:text-2xl">{texts.title}</h2>
          <p className="text-sm text-muted-foreground">{texts.subtitle}</p>
        </div>
      </div>
      <ul className="grid gap-2 text-sm sm:grid-cols-2">
        {texts.points.map((point) => (
          <li key={point} className="flex items-center gap-2.5">
            <span className="grid size-5 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground">
              <Check className="size-3" strokeWidth={3} />
            </span>
            {point}
          </li>
        ))}
      </ul>
      <RouteSearchLink
        href={ROUTES.search(lang, "multiCity")}
        route={route}
        spot="card"
        className="h-auto min-h-11 w-fit px-6 py-2.5 font-bold whitespace-normal max-sm:w-full"
      >
        {texts.button}
      </RouteSearchLink>
    </section>
  );
};

export default RouteSearchCard;
