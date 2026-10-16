import Link from "next/link";
import { routeTexts } from "@/components/flightRoutes/data/texts";
import { searchLink } from "@/components/flightRoutes/RoutePage/utils/searchLink";
import { cn } from "@/utils/cn";

// The cheapest flight of each coming month as bars (one series, coral; the cheapest month marked), each opening
// the search for that month. `months`: [{ month, fare }]; `write`: money; `monthName`: "nov".
const MonthPrices = ({ lang, route, months, cheapestMonth, write, monthName }) => {
  const texts = routeTexts(lang);
  const highest = Math.max(...months.map((entry) => entry.fare.price));
  return (
    <section className="grid gap-4 rounded-xl bg-card p-5 ring-1 ring-foreground/10 sm:p-6">
      <div className="grid gap-0.5">
        <h2 className="font-heading text-xl font-bold">{texts.byMonth}</h2>
        <p className="text-sm text-muted-foreground">{texts.byMonthHint}</p>
      </div>
      {/* One row, a column per month however narrow the screen */}
      <ol className="grid auto-cols-fr grid-flow-col items-end gap-1 sm:gap-2">
        {months.map(({ month, fare }) => {
          const cheapest = month === cheapestMonth;
          return (
            <li key={month}>
              <Link
                href={searchLink(lang, route, month)}
                aria-label={`${monthName(month)}: ${write(fare.price)}`}
                className="group grid h-48 grid-rows-[auto_minmax(0,1fr)_auto] gap-1.5 rounded-lg p-1 text-center outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <span className={cn("text-[0.6875rem] font-semibold tabular-nums sm:text-sm", cheapest && "text-primary-ink")}>{write(fare.price)}</span>
                <span className="flex items-end">
                  <span
                    className={cn("w-full rounded-t-[4px] transition-opacity group-hover:opacity-80", cheapest ? "bg-primary" : "bg-primary/45")}
                    style={{ height: `${Math.max((fare.price / highest) * 100, 6)}%` }}
                  />
                </span>
                <span className={cn("text-xs text-muted-foreground capitalize", cheapest && "font-semibold text-foreground")}>{monthName(month)}</span>
              </Link>
            </li>
          );
        })}
      </ol>
      <p className="text-xs text-muted-foreground">{texts.updated}</p>
    </section>
  );
};

export default MonthPrices;
