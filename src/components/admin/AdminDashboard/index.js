import DailyBars from "@/components/admin/AdminDashboard/components/DailyBars";
import StatTile from "@/components/admin/StatTile";
import TopDestinations from "@/components/admin/AdminDashboard/components/TopDestinations";
import { adminTexts } from "@/components/admin/data/texts";
import { adminFormat } from "@/components/admin/data/format";

// The admin's figures (server/admin/stats): headline numbers, then each day of the last weeks, then where people go
const AdminDashboard = ({ stats, lang }) => {
  const { days, users, itineraries, destinations, trips } = stats;
  const texts = adminTexts(lang).dashboard;
  const formats = adminFormat(lang);
  return (
    <div className="grid gap-6">
      <div className="grid gap-1">
        <h1 className="font-heading text-3xl font-extrabold tracking-tight sm:text-4xl">{texts.title}</h1>
        <p className="text-muted-foreground">{texts.subtitle(days)}</p>
      </div>

      <dl className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile label={texts.users} value={formats.count(users.total)} hint={texts.usersHint(users.google, users.email)} />
        <StatTile label={texts.newUsers} value={formats.count(users.lastWeek)} />
        <StatTile label={texts.savedTrips} value={formats.count(trips.saved)} />
        <StatTile label={texts.sharedTrips} value={formats.count(trips.shared)} />
        <StatTile label={texts.itineraries} value={formats.count(itineraries.recent)} />
        <StatTile label={texts.aiCost} value={formats.money(itineraries.recentCost)} hint={texts.aiCostHint} />
        <StatTile label={texts.costPerItinerary} value={formats.money(itineraries.costPerItinerary)} />
        <StatTile label={texts.claudeShare} value={formats.percent(itineraries.claudeShare)} hint={texts.claudeShareHint} />
      </dl>

      <div className="grid gap-6 lg:grid-cols-2">
        <DailyBars lang={lang} title={texts.dailyItineraries} days={itineraries.daily} format={formats.count} />
        <DailyBars lang={lang} title={texts.dailyCost} days={itineraries.dailyCost} format={formats.money} />
        <DailyBars lang={lang} title={texts.dailyUsers} days={users.daily} format={formats.count} />
        <TopDestinations destinations={destinations} lang={lang} />
      </div>
    </div>
  );
};

export default AdminDashboard;
