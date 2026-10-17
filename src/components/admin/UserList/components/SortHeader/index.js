import Link from "next/link";
import { ArrowDown, ArrowUp } from "lucide-react";
import { SORTS, userListHref } from "@/constants/adminUserList";
import { adminTexts } from "@/components/admin/data/texts";
import { cn } from "@/utils/cn";

// A column's name that sorts the list by it: first in its usual direction, then the other way. The column it is
// sorted by shows its arrow. `sort`: a key of SORTS; `view`: the list's view; `right`: a figure's column.
const SortHeader = ({ sort, view, lang, right = false }) => {
  const texts = adminTexts(lang).users;
  const active = view.sort === sort;
  const dir = active ? (view.dir === "asc" ? "desc" : "asc") : SORTS[sort].start;
  const Arrow = view.dir === "asc" ? ArrowUp : ArrowDown;
  const words = texts.sorts[sort].split(" ");
  const [firstWords, lastWord] = [words.slice(0, -1).join(" "), words.at(-1)];
  return (
    <span className={cn(right && "text-right")}>
      {/* The arrow goes right after the name, kept with its last word when the name wraps */}
      <Link
        href={userListHref(lang, { ...view, sort, dir, page: 1 })}
        aria-label={texts.sortBy(texts.sorts[sort], dir)}
        className={cn("rounded-sm outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50", active && "text-foreground")}
      >
        {firstWords && `${firstWords} `}
        <span className="whitespace-nowrap">
          {lastWord}
          {active && <Arrow aria-hidden className="ml-1 inline size-3.5 align-[-0.15em]" />}
        </span>
      </Link>
    </span>
  );
};

export default SortHeader;
