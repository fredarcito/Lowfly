import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { USERS_PER_PAGE, userListHref } from "@/constants/adminUserList";
import { adminTexts } from "@/components/admin/data/texts";
import { adminFormat } from "@/components/admin/data/format";
import { cn } from "@/utils/cn";

const STEP = "inline-flex h-10 items-center gap-1 rounded-lg border px-3 text-sm font-medium transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50";

// Which accounts are shown ("21–40 of 57") and the previous and next pages. Nothing when all fit in one.
const Pagination = ({ view, total, pages, lang }) => {
  if (pages <= 1) return null;
  const texts = adminTexts(lang).users;
  const formats = adminFormat(lang);
  const first = (view.page - 1) * USERS_PER_PAGE + 1;
  const last = Math.min(view.page * USERS_PER_PAGE, total);
  const step = (page, label, Icon, after) =>
    page >= 1 && page <= pages ? (
      <Link href={userListHref(lang, { ...view, page })} className={cn(STEP, "hover:bg-muted")}>
        {!after && <Icon className="size-4" />} {label} {after && <Icon className="size-4" />}
      </Link>
    ) : (
      <span aria-disabled className={cn(STEP, "text-muted-foreground opacity-50")}>
        {!after && <Icon className="size-4" />} {label} {after && <Icon className="size-4" />}
      </span>
    );
  return (
    <nav aria-label={texts.pagination} className="flex flex-wrap items-center justify-between gap-3">
      <p className="text-sm text-muted-foreground tabular-nums">{texts.range(formats.count(first), formats.count(last), formats.count(total))}</p>
      <div className="flex gap-2">
        {step(view.page - 1, texts.previous, ChevronLeft, false)}
        {step(view.page + 1, texts.next, ChevronRight, true)}
      </div>
    </nav>
  );
};

export default Pagination;
