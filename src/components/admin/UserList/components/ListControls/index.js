"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowDownWideNarrow, ArrowUpNarrowWide } from "lucide-react";
import SelectField from "@/components/admin/UserList/components/ListControls/components/SelectField";
import { FILTERS, SORTS, userListHref } from "@/constants/adminUserList";
import { adminTexts } from "@/components/admin/data/texts";

// Which accounts to show and in what order (the column headers sort too, on wide screens): each change opens
// the list's first page with it. `view`: the list's view (constants/adminUserList).
const ListControls = ({ view, lang }) => {
  const texts = adminTexts(lang).users;
  const router = useRouter();
  const go = (changes) => router.push(userListHref(lang, { ...view, ...changes, page: 1 }));
  const otherDir = view.dir === "asc" ? "desc" : "asc";
  const DirIcon = view.dir === "asc" ? ArrowUpNarrowWide : ArrowDownWideNarrow;
  return (
    <div className="flex flex-wrap items-center gap-2">
      <SelectField
        label={texts.filterLabel}
        value={view.filter}
        onChange={(filter) => go({ filter })}
        options={Object.keys(FILTERS).map((filter) => ({ value: filter, label: texts.filters[filter] }))}
      />
      <div className="flex items-center gap-2">
        <SelectField
          label={texts.sortLabel}
          value={view.sort}
          onChange={(sort) => go({ sort, dir: SORTS[sort].start })}
          options={Object.keys(SORTS).map((sort) => ({ value: sort, label: `${texts.sortLabel}: ${texts.sorts[sort]}` }))}
        />
        <Link
          href={userListHref(lang, { ...view, dir: otherDir, page: 1 })}
          aria-label={texts.direction[view.dir]}
          title={texts.direction[view.dir]}
          className="grid size-11 shrink-0 place-items-center rounded-lg border border-input text-muted-foreground transition-colors outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
        >
          <DirIcon className="size-4" />
        </Link>
      </div>
    </div>
  );
};

export default ListControls;
