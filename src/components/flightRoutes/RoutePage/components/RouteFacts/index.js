import { routeTexts } from "@/components/flightRoutes/data/texts";

// What to know about the route, at a glance: `facts` [{ icon, label, value }] (airline, from, to, flight time, direct,
// cheapest month), the ones with no value left out
const RouteFacts = ({ lang, facts }) => {
  const texts = routeTexts(lang);
  return (
    <section className="grid content-start gap-3 rounded-xl bg-card p-5 ring-1 ring-foreground/10 sm:p-6">
      <h2 className="font-heading text-xl font-bold">{texts.facts}</h2>
      <dl className="grid">
        {facts
          .filter((fact) => fact.value)
          .map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-center gap-3 border-b py-2.5 last:border-b-0">
              <Icon className="size-4 shrink-0 text-muted-foreground" />
              <dt className="min-w-0 flex-1 text-sm text-muted-foreground">{label}</dt>
              <dd className="text-right font-medium first-letter:uppercase">{value}</dd>
            </div>
          ))}
      </dl>
    </section>
  );
};

export default RouteFacts;
