import { pad } from "@/utils/dates";
import { useI18n } from "@/context/i18n";
import { airlineNames, heatOf } from "@/utils/format";
import { cn } from "@/utils/cn";

const CELL = "flex h-13 flex-col justify-between rounded-md p-1 text-[0.7rem] leading-none sm:h-14 sm:p-1.5 sm:text-xs";

// One month with the cheapest price of each day. The yellower, the cheaper. A day with no flight is just its number,
// quieter than the days with a price; a day outside the search, quieter still.
const PriceCalendar = ({ month, byDay, min, max, bestDay, from, to, origin }) => {
  const { texts, format } = useI18n();
  const [year, monthNumber] = month.split("-").map(Number);
  const first = new Date(year, monthNumber - 1, 1);
  const total = new Date(year, monthNumber, 0).getDate();
  const offset = (first.getDay() + 6) % 7;

  const cells = [];
  for (let blank = 0; blank < offset; blank++) cells.push(<div key={`e${blank}`} />);

  for (let dayOfMonth = 1; dayOfMonth <= total; dayOfMonth++) {
    const key = `${year}-${pad(monthNumber)}-${pad(dayOfMonth)}`;
    const fare = byDay[key];
    if (key < from || key > to) {
      cells.push(
        <div key={key} className={cn(CELL, "text-muted-foreground/25")}>
          {dayOfMonth}
        </div>
      );
    } else if (!fare) {
      cells.push(
        <div key={key} className={cn(CELL, "text-muted-foreground/60")} title={texts.results.dayNoFlights}>
          {dayOfMonth}
        </div>
      );
    } else {
      const heat = heatOf(fare.price, min, max);
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
          href={format.fareLinks(fare, origin)[0].href}
          target="_blank"
          rel="noopener noreferrer"
          title={`${format.money(fare.price, fare.cur)} · ${fare.city} · ${airlineNames(fare)}${fare.ret ? ` · ${texts.results.dayReturn(format.fmtDay(fare.ret.day))}` : ""}`}
          aria-label={`${texts.results.dayAria(dayOfMonth, format.money(fare.price, fare.cur), fare.city, airlineNames(fare))}${fare.ret ? `, ${texts.results.dayReturn(format.fmtDay(fare.ret.day))}` : ""}`}
        >
          <span>{dayOfMonth}</span>
          <b className="self-end font-heading text-xs font-extrabold tabular-nums sm:text-sm">{Math.round(fare.price)}</b>
        </a>
      );
    }
  }

  return (
    <div className="grid content-start gap-2">
      <h3 className="font-heading text-base font-semibold first-letter:uppercase">{format.fmtMonth(month)}</h3>
      <div className="grid grid-cols-7 gap-1">
        {format.weekdays.map((weekday, weekdayIndex) => (
          <div key={weekdayIndex} className="pb-1 text-center text-xs text-muted-foreground">
            {weekday}
          </div>
        ))}
        {cells}
      </div>
    </div>
  );
};

export default PriceCalendar;
