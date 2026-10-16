import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import UserRow from "@/components/admin/UserList/components/UserRow";
import { adminTexts } from "@/components/admin/data/texts";
import { adminFormat } from "@/components/admin/data/format";

// Every account, newest first, with a search by email or name (?q=, sent by the form as in any GET search).
// `users`: server/admin/users's list; `globalLimit`: the daily limit of accounts without their own.
const UserList = ({ users, globalLimit, query, lang }) => {
  const texts = adminTexts(lang).users;
  const formats = adminFormat(lang);
  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="grid gap-1">
          <h1 className="font-heading text-3xl font-extrabold tracking-tight sm:text-4xl">{texts.title}</h1>
          <p className="text-muted-foreground">
            {texts.summary(formats.count(users.length), query, globalLimit)}
          </p>
        </div>
        <form role="search" className="relative w-full sm:w-72">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input name="q" type="search" defaultValue={query} placeholder={texts.search} aria-label={texts.searchLabel} className="h-11 pl-9 text-base md:text-sm" />
        </form>
      </div>

      <div className="overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10">
        {/* Column names, on wide screens (on phones each account is a card that names its figures) */}
        <div aria-hidden className="hidden grid-cols-[minmax(0,2.4fr)_repeat(6,minmax(0,1fr))] gap-3 border-b px-5 py-3 text-xs font-medium text-muted-foreground lg:grid">
          <span>{texts.columns.user}</span>
          <span>{texts.columns.joined}</span>
          <span>{texts.columns.lastSeen}</span>
          <span className="text-right">{texts.columns.trips}</span>
          <span className="text-right">{texts.columns.itineraries}</span>
          <span className="text-right">{texts.columns.aiCost}</span>
          <span className="text-right">{texts.columns.limit}</span>
        </div>
        {users.length === 0 ? (
          <p className="p-6 text-center text-sm text-muted-foreground">{texts.none(query)}</p>
        ) : (
          <ul className="divide-y">
            {users.map((user) => (
              <UserRow key={user.id} user={user} globalLimit={globalLimit} />
            ))}
          </ul>
        )}
      </div>
      <p className="text-xs text-muted-foreground">{texts.footnote}</p>
    </div>
  );
};

export default UserList;
