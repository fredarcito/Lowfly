import { adminTexts } from "@/components/admin/data/texts";
import { adminFormat } from "@/components/admin/data/format";
import { cn } from "@/utils/cn";

// A figure per day as coral bars (one series: no legend, the title names it). Hovering a bar shows its day and
// value; the busiest day is labelled; screen readers get the same numbers as a table. `days`: [{ day, value }];
// `format` writes a value. Labels near an edge line up with it instead of centring, so they stay in the card.
const anchorOf = (index, count) =>
  index < count * 0.2 ? "left-0" : index > count * 0.8 ? "right-0" : "left-1/2 -translate-x-1/2";

const DailyBars = ({ title, days, format, lang }) => {
  const texts = adminTexts(lang).dashboard;
  const formats = adminFormat(lang);
  const highest = Math.max(...days.map((entry) => entry.value));
  const peak = highest > 0 ? days.findIndex((entry) => entry.value === highest) : -1;
  return (
    <section className="grid gap-4 rounded-xl bg-card p-5 ring-1 ring-foreground/10">
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="font-heading text-lg font-bold">{title}</h2>
        <p className="text-sm text-muted-foreground tabular-nums">{format(days.reduce((total, entry) => total + entry.value, 0))}</p>
      </div>
      <div aria-hidden className="relative flex h-36 items-end gap-0.5 border-b border-foreground/15 pt-6">
        {days.map((entry, index) => (
          <div key={entry.day} className="group relative flex h-full flex-1 items-end">
            <div
              className="w-full rounded-t-[4px] bg-primary transition-opacity group-hover:opacity-80"
              style={{ height: highest ? `${Math.max((entry.value / highest) * 100, entry.value ? 2 : 0)}%` : 0 }}
            />
            {index === peak && (
              <span className={cn("absolute bottom-full pb-1 text-xs font-medium whitespace-nowrap tabular-nums group-hover:hidden", anchorOf(index, days.length))}>
                {format(entry.value)}
              </span>
            )}
            <span
              className={cn(
                "pointer-events-none absolute bottom-full z-10 mb-1 hidden rounded-md bg-popover px-2 py-1 text-xs whitespace-nowrap text-popover-foreground shadow-md ring-1 ring-foreground/10 group-hover:block",
                anchorOf(index, days.length)
              )}
            >
              {formats.day(entry.day)} · <span className="font-semibold tabular-nums">{format(entry.value)}</span>
            </span>
          </div>
        ))}
      </div>
      <div aria-hidden className="flex justify-between text-xs text-muted-foreground">
        <span>{formats.day(days[0].day)}</span>
        <span>{formats.day(days.at(-1).day)}</span>
      </div>
      {/* A table ignores the 1px box of sr-only: its wrapper hides it */}
      <div className="sr-only">
        <table>
          <caption>{title}</caption>
          <thead>
            <tr>
              <th scope="col">{texts.day}</th>
              <th scope="col">{texts.value}</th>
            </tr>
          </thead>
          <tbody>
            {days.map((entry) => (
              <tr key={entry.day}>
                <td>{formats.day(entry.day)}</td>
                <td>{format(entry.value)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default DailyBars;
