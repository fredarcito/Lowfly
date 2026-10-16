import Link from "next/link";
import { ArrowLeft, Gauge, Plane, Sparkles, UserCog, UserX } from "lucide-react";
import StatTile from "@/components/admin/StatTile";
import AccountForm from "@/components/admin/UserDetail/components/AccountForm";
import DeleteAccount from "@/components/admin/UserDetail/components/DeleteAccount";
import LimitForm from "@/components/admin/UserDetail/components/LimitForm";
import Section from "@/components/admin/UserDetail/components/Section";
import TripItem from "@/components/admin/UserDetail/components/TripItem";
import UsageTable from "@/components/admin/UserDetail/components/UsageTable";
import UserHeader from "@/components/admin/UserDetail/components/UserHeader";
import { adminTexts } from "@/components/admin/data/texts";
import { adminFormat } from "@/components/admin/data/format";
import { ROUTES } from "@/constants/routes";

// One account for the admin: who it is and its figures, then everything else in folds, each saying in a line what
// it holds: its trips (open; their itineraries can be deleted), every AI call it made, its daily limit, its details
// (name, email, admin, blocked) and deleting it. `user`: server/admin/users's getAdminUser; `self`: the admin's own.
const UserDetail = ({ user, lang, self }) => {
  const all = adminTexts(lang);
  const texts = all.user;
  const formats = adminFormat(lang);
  const shared = user.trips.filter((trip) => trip.shared).length;
  const limit = user.ownLimit ?? user.globalLimit;
  return (
    <div className="grid gap-6">
      <Link href={ROUTES.adminUsers(lang)} className="flex w-fit items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> {texts.back}
      </Link>
      <UserHeader user={user} lang={lang} />

      <dl className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile label={texts.trips} value={formats.count(user.trips.length)} hint={texts.shared(shared)} />
        <StatTile label={texts.itineraries} value={formats.count(user.itineraries)} hint={texts.itinerariesHint} />
        <StatTile label={texts.aiCost} value={formats.money(user.cost)} hint={texts.listPrice} />
        <StatTile label={texts.limit} value={limit} hint={user.ownLimit === null ? texts.limitGlobal : texts.limitOwn} />
      </dl>

      <div className="divide-y overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10">
        <Section id="trips" icon={<Plane />} title={texts.tripsTitle} summary={texts.sections.trips(user.trips.length, shared)} defaultOpen>
          {user.trips.length === 0 ? (
            <p className="text-sm text-muted-foreground">{texts.noTrips}</p>
          ) : (
            <ul className="grid divide-y">
              {user.trips.map((trip) => (
                <TripItem key={trip.id} userId={user.id} trip={trip} />
              ))}
            </ul>
          )}
        </Section>
        <Section id="usage" icon={<Sparkles />} title={texts.usageTitle} summary={texts.sections.usage(formats.count(user.usage.length), formats.money(user.cost))}>
          <div className="grid gap-3">
            <p className="text-sm text-muted-foreground">{texts.usageHint}</p>
            <UsageTable calls={user.usage} lang={lang} />
          </div>
        </Section>
        <Section id="limit" icon={<Gauge />} title={texts.limitTitle} summary={texts.sections.limit(limit, user.ownLimit !== null)}>
          <div className="grid max-w-md gap-3">
            <p className="text-sm text-muted-foreground">{texts.limitHint}</p>
            <LimitForm userId={user.id} ownLimit={user.ownLimit} globalLimit={user.globalLimit} />
          </div>
        </Section>
        <Section id="account" icon={<UserCog />} title={all.account.title} summary={texts.sections.account}>
          <div className="max-w-md">
            <AccountForm user={user} self={self} />
          </div>
        </Section>
        <Section id="delete" icon={<UserX />} title={all.account.deleteTitle} summary={texts.sections.delete} danger>
          <div className="max-w-md">
            <DeleteAccount user={user} self={self} />
          </div>
        </Section>
      </div>
    </div>
  );
};

export default UserDetail;
