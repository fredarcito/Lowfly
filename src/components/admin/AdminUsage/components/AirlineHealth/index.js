import { CircleAlert, CircleCheck } from "lucide-react";
import { adminTexts } from "@/components/admin/data/texts";
import { adminFormat } from "@/components/admin/data/format";
import { AIRLINES } from "@/utils/format";

// The share of requests failed from which an airline is marked as having trouble
const TROUBLE_SHARE = 0.05;

// How each airline answers: the answers searches needed, how many came from the cache (never asked), the requests
// sent, and what went wrong (blocks, errors, paused, a queue too long; and old prices shown instead). A table, with a
// row per airline, scrolling sideways on phones. `airlines`: [{ airline, needed, cached, sent, blocked, error,
// paused, busy, stale, cacheShare, failShare }].
const AirlineHealth = ({ airlines, lang }) => {
  const texts = adminTexts(lang).usage;
  const formats = adminFormat(lang);
  const columns = texts.airlineColumns;
  const problems = ["blocked", "error", "paused", "busy", "stale"];
  return (
    <section className="grid min-w-0 content-start gap-5 rounded-xl bg-card p-5 ring-1 ring-foreground/10 sm:p-6">
      <div className="grid gap-0.5">
        <h2 className="font-heading text-lg font-bold">{texts.airlines}</h2>
        <p className="text-sm text-muted-foreground">{texts.airlinesHint}</p>
      </div>
      <div className="-mx-5 overflow-x-auto px-5 sm:-mx-6 sm:px-6">
        <table className="w-full min-w-[40rem] text-sm">
          <thead>
            <tr className="border-b text-left text-xs text-muted-foreground">
              <th scope="col" className="py-2 pr-3 font-medium">
                {columns.airline}
              </th>
              {["needed", "cached", "sent", ...problems].map((column) => (
                <th key={column} scope="col" title={texts.airlineHelp[column]} className="px-3 py-2 text-right font-medium">
                  {columns[column]}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {airlines.map((airline) => {
              const trouble = airline.failShare >= TROUBLE_SHARE;
              const Icon = trouble ? CircleAlert : CircleCheck;
              return (
                <tr key={airline.airline} className="border-b last:border-0">
                  <th scope="row" className="py-3 pr-3 text-left font-medium">
                    <span className="flex items-center gap-2">
                      <Icon className={trouble ? "size-4 text-destructive" : "size-4 text-muted-foreground"} />
                      {AIRLINES[airline.airline] ?? texts.airlineNames[airline.airline] ?? airline.airline}
                    </span>
                    <span className="block text-xs font-normal text-muted-foreground">{texts.failShare(formats.percent(airline.failShare))}</span>
                  </th>
                  <td className="px-3 py-3 text-right tabular-nums">{formats.count(airline.needed)}</td>
                  <td className="px-3 py-3 text-right tabular-nums">
                    {formats.count(airline.cached)}
                    <span className="block text-xs text-muted-foreground">{formats.percent(airline.cacheShare)}</span>
                  </td>
                  <td className="px-3 py-3 text-right tabular-nums">{formats.count(airline.sent)}</td>
                  {problems.map((problem) => (
                    <td key={problem} className={airline[problem] ? "px-3 py-3 text-right font-semibold tabular-nums" : "px-3 py-3 text-right text-muted-foreground tabular-nums"}>
                      {formats.count(airline[problem])}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default AirlineHealth;
