import { adminTexts } from "@/components/admin/data/texts";
import { adminFormat } from "@/components/admin/data/format";

// The searches by kind, most used first: how many, a bar for its share of all of them (the number beside it, in ink),
// and how they ended (with results, none, an error) and, searching a range of dates, how many changed the form's
// dates. `searches`: [{ mode, total, results, empty, failed, customDates }].
const SearchModes = ({ searches, lang }) => {
  const texts = adminTexts(lang).usage;
  const formats = adminFormat(lang);
  const all = searches.reduce((total, search) => total + search.total, 0);
  const share = (part, whole) => (whole ? formats.percent(part / whole) : "—");
  return (
    <section className="grid min-w-0 content-start gap-5 rounded-xl bg-card p-5 ring-1 ring-foreground/10 sm:p-6">
      <div className="grid gap-0.5">
        <h2 className="font-heading text-lg font-bold">{texts.byMode}</h2>
        <p className="text-sm text-muted-foreground">{texts.byModeHint}</p>
      </div>
      <ol className="grid gap-5">
        {searches.map((search) => (
          <li key={search.mode} className="grid gap-2">
            <div className="flex items-baseline justify-between gap-3 text-sm">
              <span className="font-medium">{texts.modes[search.mode]}</span>
              <span className="tabular-nums">
                <span className="font-semibold">{formats.count(search.total)}</span>
                <span className="text-muted-foreground"> · {share(search.total, all)}</span>
              </span>
            </div>
            <div aria-hidden className="h-1.5 overflow-hidden rounded-full bg-muted">
              <div className="h-full rounded-full bg-primary" style={{ width: all ? `${(search.total / all) * 100}%` : 0 }} />
            </div>
            <dl className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
              <div className="flex gap-1">
                <dt>{texts.columns.results}</dt>
                <dd className="text-foreground tabular-nums">{share(search.results, search.total)}</dd>
              </div>
              <div className="flex gap-1">
                <dt>{texts.columns.empty}</dt>
                <dd className="text-foreground tabular-nums">{share(search.empty, search.total)}</dd>
              </div>
              <div className="flex gap-1">
                <dt>{texts.columns.failed}</dt>
                <dd className="text-foreground tabular-nums">{share(search.failed, search.total)}</dd>
              </div>
              {["everywhere", "country"].includes(search.mode) && (
                <div className="flex gap-1" title={texts.customDatesHint}>
                  <dt>{texts.columns.customDates}</dt>
                  <dd className="text-foreground tabular-nums">{share(search.customDates, search.total)}</dd>
                </div>
              )}
            </dl>
          </li>
        ))}
      </ol>
    </section>
  );
};

export default SearchModes;
