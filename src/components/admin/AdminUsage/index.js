import StatTile from "@/components/admin/StatTile";
import PeriodSelect from "@/components/admin/PeriodSelect";
import AirlineHealth from "@/components/admin/AdminUsage/components/AirlineHealth";
import SearchModes from "@/components/admin/AdminUsage/components/SearchModes";
import TopFails from "@/components/admin/AdminUsage/components/TopFails";
import UsageTrend from "@/components/admin/AdminUsage/components/UsageTrend";
import { adminTexts } from "@/components/admin/data/texts";
import { adminFormat } from "@/components/admin/data/format";

// The admin's "Uso" page for a period (server/admin/usage): which kinds of search people use and how they end, and
// how the airlines answer. The headline numbers, the searches by kind next to the errors they end with, the airlines
// and the trend (with its own zoom: week, month or year).
const AdminUsage = ({ stats, periods, lang }) => {
  const texts = adminTexts(lang).usage;
  const formats = adminFormat(lang);

  const header = (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div className="grid gap-1">
        <h1 className="font-heading text-3xl font-extrabold tracking-tight sm:text-4xl">{texts.title}</h1>
        <p className="text-muted-foreground">{texts.subtitle}</p>
      </div>
      <PeriodSelect period={stats.period} periods={periods} />
    </div>
  );
  if (!stats.available) {
    return (
      <div className="grid grid-cols-1 gap-6">
        {header}
        <p className="rounded-xl border border-dashed p-6 text-sm text-muted-foreground">{texts.unavailable}</p>
      </div>
    );
  }

  const { searches, airlines, trend } = stats;
  const total = searches.reduce((sum, search) => sum + search.total, 0);
  const empty = searches.reduce((sum, search) => sum + search.empty, 0);
  const failed = searches.reduce((sum, search) => sum + search.failed, 0);
  const [mostUsed] = searches;
  const needed = airlines.reduce((sum, airline) => sum + airline.needed, 0);
  const cached = airlines.reduce((sum, airline) => sum + airline.cached, 0);
  const share = (part, whole) => formats.percent(whole ? part / whole : 0);

  return (
    <div className="grid grid-cols-1 gap-6">
      {header}

      <dl className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile label={texts.searches} value={formats.count(total)} hint={texts.searchesHint(formats.decimal(total / stats.days))} />
        <StatTile
          label={texts.mostUsed}
          value={total ? texts.modes[mostUsed.mode] : "—"}
          hint={total ? texts.mostUsedHint(share(mostUsed.total, total)) : texts.noSearches}
        />
        <StatTile label={texts.unanswered} value={share(empty + failed, total)} hint={texts.unansweredHint(formats.count(empty), formats.count(failed))} />
        <StatTile label={texts.fromCache} value={share(cached, needed)} hint={texts.fromCacheHint} />
      </dl>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)]">
        <SearchModes searches={searches} lang={lang} />
        <TopFails searches={searches} lang={lang} />
      </div>

      <AirlineHealth airlines={airlines} lang={lang} />
      <UsageTrend trend={trend} />
    </div>
  );
};

export default AdminUsage;
