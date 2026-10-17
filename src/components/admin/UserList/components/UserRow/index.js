"use client";

import Link from "next/link";
import { Ban, ChevronRight, ShieldCheck } from "lucide-react";
import { ROUTES } from "@/constants/routes";
import { useAdmin } from "@/components/admin/hooks/useAdmin";

// One account in the list, opening its page: a row of figures on wide screens, a card on phones
const UserRow = ({ user, globalLimit }) => {
  const { lang, texts, format } = useAdmin();
  const { columns } = texts.users;
  const figures = [
    { label: columns.joined, value: format.date(user.createdAt) },
    { label: columns.lastSeen, value: format.date(user.lastSignInAt) },
    // Active (kept now) beside all time (deleted ones too), for trips and for itineraries
    { label: columns.tripsActive, value: format.count(user.trips), number: true },
    { label: columns.tripsTotal, value: format.count(user.tripsSaved), number: true },
    { label: columns.itinerariesActive, value: format.count(user.itinerariesActive), number: true },
    { label: columns.itinerariesTotal, value: format.count(user.itineraries), number: true },
    { label: columns.aiCost, value: format.money(user.cost), number: true },
    { label: columns.limit, value: user.ownLimit ?? `${globalLimit}*`, number: true },
  ];
  return (
    <li>
      <Link
        href={ROUTES.adminUser(lang, user.id)}
        className="grid gap-3 px-5 py-4 transition-colors outline-none hover:bg-muted/50 focus-visible:bg-muted/50 lg:grid-cols-[minmax(0,2.4fr)_repeat(8,minmax(0,1fr))] lg:items-center"
      >
        <span className="flex min-w-0 items-center gap-3">
          <span className="grid min-w-0 flex-1 gap-0.5">
            <span className="flex min-w-0 items-center gap-1.5 font-medium">
              <span className="truncate">{user.name ?? user.email}</span>
              {user.admin && <ShieldCheck className="size-4 shrink-0 text-primary-ink" aria-label={texts.admin} />}
              {user.blocked && <Ban className="size-4 shrink-0 text-destructive" aria-label={texts.account.blockedBadge} />}
            </span>
            <span className="truncate text-sm text-muted-foreground">
              {user.name ? `${user.email} · ` : ""}
              {user.google ? texts.users.google : texts.users.email}
            </span>
          </span>
          <ChevronRight className="size-4 shrink-0 text-muted-foreground lg:hidden" />
        </span>
        <dl className="grid grid-cols-2 gap-x-3 gap-y-2 text-sm sm:grid-cols-4 lg:contents">
          {figures.map((figure) => (
            <div key={figure.label} className={figure.number ? "lg:text-right" : undefined}>
              <dt className="text-xs text-muted-foreground lg:sr-only">{figure.label}</dt>
              <dd className={figure.number ? "tabular-nums" : undefined}>{figure.value}</dd>
            </div>
          ))}
        </dl>
      </Link>
    </li>
  );
};

export default UserRow;
