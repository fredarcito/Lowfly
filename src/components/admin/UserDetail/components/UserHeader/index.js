import { Ban, ShieldCheck } from "lucide-react";
import { adminTexts } from "@/components/admin/data/texts";
import { adminFormat } from "@/components/admin/data/format";
import { cn } from "@/utils/cn";

const BADGE = "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium";

// Two letters for the avatar: the name's initials, or the email's first letter
const initialsOf = (user) =>
  (user.name ?? "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase() || user.email?.[0]?.toUpperCase() || "?";

// Who the account is: initials, name, email, how they sign in, admin or blocked, when they joined and were last seen
const UserHeader = ({ user, lang }) => {
  const all = adminTexts(lang);
  const formats = adminFormat(lang);
  return (
    <div className="flex items-center gap-4">
      <span aria-hidden className="grid size-14 shrink-0 place-items-center rounded-2xl bg-selected font-heading text-xl font-extrabold text-primary-ink sm:size-16 sm:text-2xl">
        {initialsOf(user)}
      </span>
      <div className="grid min-w-0 gap-1.5">
        <h1 className="truncate font-heading text-2xl leading-tight font-extrabold tracking-tight sm:text-3xl">{user.name ?? user.email}</h1>
        <div className="flex flex-wrap items-center gap-1.5">
          {user.name && <span className="mr-1 truncate text-sm text-muted-foreground">{user.email}</span>}
          <span className={cn(BADGE, "bg-muted text-muted-foreground")}>{user.google ? all.users.google : all.users.email}</span>
          {user.admin && (
            <span className={cn(BADGE, "bg-selected text-primary-ink")}>
              <ShieldCheck className="size-3.5" /> {all.admin}
            </span>
          )}
          {user.blocked && (
            <span className={cn(BADGE, "bg-destructive/10 text-destructive")}>
              <Ban className="size-3.5" /> {all.account.blockedBadge}
            </span>
          )}
        </div>
        <p className="text-xs text-muted-foreground">{all.user.dates(formats.date(user.createdAt), formats.date(user.lastSignInAt, true))}</p>
      </div>
    </div>
  );
};

export default UserHeader;
