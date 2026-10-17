import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import ListControls from "@/components/admin/UserList/components/ListControls";
import Pagination from "@/components/admin/UserList/components/Pagination";
import SortHeader from "@/components/admin/UserList/components/SortHeader";
import UserRow from "@/components/admin/UserList/components/UserRow";
import { adminTexts } from "@/components/admin/data/texts";
import { adminFormat } from "@/components/admin/data/format";

// The figures' columns, in order, each sorting the list (constants/adminUserList's SORTS)
const FIGURE_COLUMNS = ["tripsActive", "tripsTotal", "itinerariesActive", "itinerariesTotal", "cost"];

// The accounts, one page at a time: a search by email or name (?q=, a GET form that keeps the filter and the
// order), a filter and an order (also by clicking a column's name), and the pages.
// `users`: this page's (server/admin/users's list); `total`: the accounts found; `view`: the list's view
// (constants/adminUserList); `globalLimit`: the daily limit of accounts without their own.
const UserList = ({ users, total, pages, globalLimit, view, lang }) => {
  const texts = adminTexts(lang).users;
  const formats = adminFormat(lang);
  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="grid gap-1">
          <h1 className="font-heading text-3xl font-extrabold tracking-tight sm:text-4xl">{texts.title}</h1>
          <p className="text-muted-foreground">{texts.summary(formats.count(total), view.q, globalLimit)}</p>
        </div>
        <form role="search" className="relative w-full sm:w-72">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input name="q" type="search" defaultValue={view.q} placeholder={texts.search} aria-label={texts.searchLabel} className="h-11 pl-9 text-base md:text-sm" />
          {/* A new search keeps the filter and the order, from its first page */}
          <input type="hidden" name="filter" value={view.filter} />
          <input type="hidden" name="sort" value={view.sort} />
          <input type="hidden" name="dir" value={view.dir} />
        </form>
      </div>

      <ListControls view={view} lang={lang} />

      <div className="overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10">
        {/* Column names, on wide screens, each sorting the list (on phones each account is a card that names its
            figures, and the order is picked above) */}
        <div className="hidden grid-cols-[minmax(0,2.4fr)_repeat(8,minmax(0,1fr))] items-center gap-3 border-b px-5 py-3 text-xs leading-snug font-medium text-muted-foreground lg:grid">
          <SortHeader sort="name" view={view} lang={lang} />
          <SortHeader sort="joined" view={view} lang={lang} />
          <SortHeader sort="lastSeen" view={view} lang={lang} />
          {FIGURE_COLUMNS.map((sort) => (
            <SortHeader key={sort} sort={sort} view={view} lang={lang} right />
          ))}
          <span className="text-right">{texts.columns.limit}</span>
        </div>
        {users.length === 0 ? (
          <p className="p-6 text-center text-sm text-muted-foreground">{texts.none(view.q)}</p>
        ) : (
          <ul className="divide-y">
            {users.map((user) => (
              <UserRow key={user.id} user={user} globalLimit={globalLimit} />
            ))}
          </ul>
        )}
      </div>
      <Pagination view={view} total={total} pages={pages} lang={lang} />
      <p className="text-xs text-muted-foreground">{texts.footnote}</p>
    </div>
  );
};

export default UserList;
