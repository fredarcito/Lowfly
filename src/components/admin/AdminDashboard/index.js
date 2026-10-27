import StatTile from "@/components/admin/StatTile";
import AiUsage from "@/components/admin/AdminDashboard/components/AiUsage";
import TrendChart from "@/components/admin/AdminDashboard/components/TrendChart";
import PeriodSelect from "@/components/admin/PeriodSelect";
import TopDestinations from "@/components/admin/AdminDashboard/components/TopDestinations";
import { adminTexts } from "@/components/admin/data/texts";
import { adminFormat } from "@/components/admin/data/format";

// Against the period before: "+2 vs. the previous 30 days"; for all time, how many a day
const itinerariesHint = ({ count, previous }, days, texts, formats) => {
  if (previous === null) return texts.perDay(formats.decimal(count / days));
  const change = count - previous;
  return texts.versusBefore(`${change > 0 ? "+" : ""}${change}`, days);
};

// The admin's overview for a period (server/admin/stats; picked on the top right): the headline numbers, the trend
// (with its own zoom: week, month or year) next to the destinations most planned, and the AI's use
const AdminDashboard = ({ stats, periods, lang }) => {
  const { users, trips, itineraries, trend, destinations } = stats;
  const texts = adminTexts(lang).dashboard;
  const formats = adminFormat(lang);
  return (
    <div className="grid grid-cols-1 gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="grid gap-1">
          <h1 className="font-heading text-3xl font-extrabold tracking-tight sm:text-4xl">{texts.title}</h1>
          <p className="text-muted-foreground">{texts.subtitle}</p>
        </div>
        <PeriodSelect period={stats.period} periods={periods} />
      </div>

      <dl className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile
          label={texts.users}
          value={formats.count(users.total)}
          hint={texts.usersHint(users.google, users.email)}
          footer={texts.newUsers(formats.count(users.inPeriod))}
        />
        <StatTile label={texts.savedTrips} value={formats.count(trips.saved)} hint={texts.sharedTrips(formats.count(trips.shared))} />
        <StatTile
          label={texts.itineraries}
          value={formats.count(itineraries.count)}
          hint={itinerariesHint(itineraries, stats.days, texts, formats)}
          footer={texts.guestItineraries(formats.count(itineraries.guests), formats.percent(itineraries.count ? itineraries.guests / itineraries.count : 0))}
        />
        <StatTile
          label={texts.aiCost}
          value={formats.money(itineraries.cost)}
          hint={texts.listPrice}
          footer={texts.costSplit(formats.money(itineraries.cost - itineraries.guestCost), formats.money(itineraries.guestCost))}
        />
      </dl>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)]">
        <TrendChart trend={trend} />
        <TopDestinations destinations={destinations} lang={lang} />
      </div>

      <AiUsage itineraries={itineraries} lang={lang} />
    </div>
  );
};

export default AdminDashboard;
