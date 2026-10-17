import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import StatTile from "@/components/admin/StatTile";
import AccountForm from "@/components/admin/UserDetail/components/AccountForm";
import ActivityHistory from "@/components/admin/UserDetail/components/ActivityHistory";
import DeleteAccount from "@/components/admin/UserDetail/components/DeleteAccount";
import LimitForm from "@/components/admin/UserDetail/components/LimitForm";
import TripItem from "@/components/admin/UserDetail/components/TripItem";
import UsageTable from "@/components/admin/UserDetail/components/UsageTable";
import UserHeader from "@/components/admin/UserDetail/components/UserHeader";
import { adminTexts } from "@/components/admin/data/texts";
import { adminFormat } from "@/components/admin/data/format";
import { ROUTES } from "@/constants/routes";

// min-w-0: a wide table scrolls inside its panel instead of widening the page
const PANEL = "min-w-0 rounded-xl bg-card p-5 ring-1 ring-foreground/10";
// Underlined tabs (the admin's sections above are pills): the open one in coral
const TRIGGER =
  "h-10 flex-none gap-2 px-3 text-sm data-active:text-foreground! group-data-[variant=line]/tabs-list:data-active:after:bg-primary after:bottom-[-1px]!";
const COUNT = "rounded-full bg-muted px-1.5 text-xs font-medium tabular-nums text-muted-foreground";

// One account for the admin: who it is and its figures, then tabs: its trips (whose itineraries can be deleted),
// its history (every trip it saved and itinerary it made, with dates), every AI call it made, its daily limit, and
// its details (name, email, admin, blocked) with deleting it.
// `user`: server/admin/users's getAdminUser; `self`: the admin's own account.
const UserDetail = ({ user, lang, self }) => {
  const all = adminTexts(lang);
  const texts = all.user;
  const formats = adminFormat(lang);
  const limit = user.ownLimit ?? user.globalLimit;
  return (
    <div className="grid min-w-0 grid-cols-1 gap-6">
      <Link href={ROUTES.adminUsers(lang)} className="flex w-fit items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> {texts.back}
      </Link>
      <UserHeader user={user} lang={lang} />

      <dl className="grid grid-cols-2 gap-2.5 lg:grid-cols-4">
        <StatTile
          compact
          label={texts.trips}
          value={formats.count(user.tripsSaved)}
          hint={texts.tripsHint(user.trips.length, user.trips.filter((trip) => trip.shared).length)}
        />
        <StatTile compact label={texts.itineraries} value={formats.count(user.itineraries)} hint={texts.itinerariesHint} />
        <StatTile compact label={texts.aiCost} value={formats.money(user.cost)} hint={texts.listPrice} />
        <StatTile compact label={texts.limit} value={limit} hint={user.ownLimit === null ? texts.limitGlobal : texts.limitOwn} />
      </dl>

      <Tabs defaultValue="trips" className="gap-4">
        <TabsList variant="line" aria-label={texts.tabs.label} className="h-auto! w-full justify-start gap-1 overflow-x-auto border-b p-0">
          <TabsTrigger value="trips" className={TRIGGER}>
            {texts.tabs.trips} <span className={COUNT}>{formats.count(user.trips.length)}</span>
          </TabsTrigger>
          <TabsTrigger value="history" className={TRIGGER}>
            {texts.tabs.history}
          </TabsTrigger>
          <TabsTrigger value="usage" aria-label={texts.tabs.usage} className={TRIGGER}>
            {/* Phones: the short name, so the four tabs fit */}
            <span className="sm:hidden">{texts.tabs.usageShort}</span>
            <span className="max-sm:hidden">{texts.tabs.usage}</span>
            <span className={COUNT}>{formats.count(user.usage.length)}</span>
          </TabsTrigger>
          <TabsTrigger value="limit" className={TRIGGER}>
            {texts.tabs.limit}
          </TabsTrigger>
          <TabsTrigger value="account" className={TRIGGER}>
            {texts.tabs.account}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="trips" className={PANEL}>
          {user.trips.length === 0 ? (
            <p className="text-sm text-muted-foreground">{texts.noTrips}</p>
          ) : (
            <ul className="grid divide-y">
              {user.trips.map((trip) => (
                <TripItem key={trip.id} userId={user.id} trip={trip} />
              ))}
            </ul>
          )}
        </TabsContent>

        <TabsContent value="history" className={PANEL}>
          <ActivityHistory history={user.history} lang={lang} />
        </TabsContent>

        <TabsContent value="usage" className={`${PANEL} grid grid-cols-1 gap-3`}>
          <p className="text-sm text-muted-foreground">{texts.usageHint}</p>
          <UsageTable calls={user.usage} lang={lang} />
        </TabsContent>

        <TabsContent value="limit" className={PANEL}>
          <div className="grid max-w-md gap-3">
            <p className="text-sm text-muted-foreground">{texts.limitHint}</p>
            <LimitForm userId={user.id} ownLimit={user.ownLimit} globalLimit={user.globalLimit} />
          </div>
        </TabsContent>

        <TabsContent value="account" className={`${PANEL} grid grid-cols-1 gap-6`}>
          <div className="max-w-md">
            <AccountForm user={user} self={self} />
          </div>
          {/* Apart and in red: deleting cannot be undone */}
          <div className="grid max-w-md gap-1 border-t pt-5">
            <h2 className="font-heading text-base font-bold text-destructive">{all.account.deleteTitle}</h2>
            <DeleteAccount user={user} self={self} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UserDetail;
