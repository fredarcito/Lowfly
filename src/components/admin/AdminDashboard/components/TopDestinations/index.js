import { adminTexts } from "@/components/admin/data/texts";
import { adminFormat } from "@/components/admin/data/format";

// The destinations most planned, as a ranked list with a bar for each count (the number beside it, in ink).
// `destinations`: [{ city, country, count }], most planned first.
const TopDestinations = ({ destinations, lang }) => {
  const texts = adminTexts(lang).dashboard;
  const formats = adminFormat(lang);
  const highest = destinations[0]?.count ?? 0;
  return (
    <section className="grid content-start gap-4 rounded-xl bg-card p-5 ring-1 ring-foreground/10">
      <div className="grid gap-0.5">
        <h2 className="font-heading text-lg font-bold">{texts.destinations}</h2>
        <p className="text-sm text-muted-foreground">{texts.destinationsHint}</p>
      </div>
      {destinations.length === 0 ? (
        <p className="text-sm text-muted-foreground">{texts.noDestinations}</p>
      ) : (
        <ol className="grid gap-3">
          {destinations.map((destination) => (
            <li key={`${destination.city}|${destination.country}`} className="grid gap-1.5">
              <div className="flex items-baseline justify-between gap-3 text-sm">
                <span className="min-w-0 truncate font-medium">
                  {destination.city}
                  {destination.country && <span className="text-muted-foreground">, {destination.country}</span>}
                </span>
                <span className="font-semibold tabular-nums">{formats.count(destination.count)}</span>
              </div>
              <div aria-hidden className="h-1.5 overflow-hidden rounded-full bg-muted">
                <div className="h-full rounded-full bg-primary" style={{ width: `${(destination.count / highest) * 100}%` }} />
              </div>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
};

export default TopDestinations;
