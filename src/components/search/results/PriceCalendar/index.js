import { pad } from "@/utils/dates";
import { useI18n } from "@/context/i18n";
import { airlineNames, heatOf } from "@/utils/format";
import { cn } from "@/utils/cn";

const CELL = "flex aspect-square flex-col justify-between rounded-md p-1 text-[0.7rem] leading-none sm:p-1.5 sm:text-xs";

// One month with the cheapest price of each day. The yellower, the cheaper.
export default function PriceCalendar({ month, byDay, min, max, bestDay, from, to, origin }) {
  const { t, f: fmt } = useI18n();
  const [y, m] = month.split("-").map(Number);
  const first = new Date(y, m - 1, 1);
  const total = new Date(y, m, 0).getDate();
  const offset = (first.getDay() + 6) % 7;

  const cells = [];
  for (let i = 0; i < offset; i++) cells.push(<div key={`e${i}`} />);

  for (let d = 1; d <= total; d++) {
    const key = `${y}-${pad(m)}-${pad(d)}`;
    const f = byDay[key];
    if (key < from || key > to) {
      cells.push(
        <div key={key} className={cn(CELL, "text-muted-foreground/40")}>
          {d}
        </div>
      );
    } else if (!f) {
      cells.push(
        <div key={key} className={cn(CELL, "bg-cell/60 text-muted-foreground")} title={t.results.dayNoFlights}>
          <span>{d}</span>
          <span className="self-end">–</span>
        </div>
      );
    } else {
      const heat = heatOf(f.price, min, max);
      cells.push(
        <a
          key={key}
          className={cn(
            CELL,
            "heat transition-transform hover:z-10 hover:scale-110 hover:shadow-md",
            heat > 55 && "heat-hot",
            key === bestDay && "ring-2 ring-primary"
          )}
          style={{ "--heat": `${heat}%` }}
          href={fmt.fareLinks(f, origin)[0].href}
          target="_blank"
          rel="noopener noreferrer"
          title={`${fmt.money(f.price, f.cur)} · ${f.city} · ${airlineNames(f)}${f.ret ? ` · ${t.results.dayReturn(fmt.fmtDay(f.ret.day))}` : ""}`}
          aria-label={`${t.results.dayAria(d, fmt.money(f.price, f.cur), f.city, airlineNames(f))}${f.ret ? `, ${t.results.dayReturn(fmt.fmtDay(f.ret.day))}` : ""}`}
        >
          <span>{d}</span>
          <b className="self-end font-heading text-xs font-extrabold tabular-nums sm:text-sm">{Math.round(f.price)}</b>
        </a>
      );
    }
  }

  return (
    <div className="grid content-start gap-2">
      <h3 className="font-heading text-base font-semibold first-letter:uppercase">{fmt.fmtMonth(month)}</h3>
      <div className="grid grid-cols-7 gap-1">
        {fmt.weekdays.map((w, i) => (
          <div key={i} className="pb-1 text-center text-xs text-muted-foreground">
            {w}
          </div>
        ))}
        {cells}
      </div>
    </div>
  );
}
