import { ChevronRight } from "lucide-react";
import AirlineBadge from "@/components/AirlineBadge";
import { useI18n } from "@/context/i18n";

// A clickable row inside a <ResultList>. Opens the booking on the airline website.
// `airlines` is the list of airlines (two if outbound and return are with different airlines)
// `tag` is an optional highlight next to the airlines ({ label, hint })
export default function ResultRow({ href, title, meta, price, cur, airlines = [], priceNote, tag }) {
  const { f } = useI18n();
  return (
    <a
      className="group flex items-center gap-3 px-4 py-3 transition-colors hover:bg-muted focus-visible:bg-muted focus-visible:outline-none sm:px-5"
      href={href}
      target="_blank"
      rel="noopener noreferrer"
    >
      <span className="grid min-w-0 flex-1 gap-1">
        <span className="truncate font-heading text-base font-semibold group-hover:underline">{title}</span>
        <span className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
          {airlines.map((a) => (
            <AirlineBadge key={a} airline={a} />
          ))}
          {tag && (
            <span title={tag.hint} className="rounded-full bg-save/15 px-2 py-0.5 text-xs font-medium text-save">
              {tag.label}
            </span>
          )}
          {meta}
        </span>
      </span>
      <span className="grid justify-items-end">
        <span className="font-heading text-xl font-extrabold tabular-nums">{f.money(price, cur)}</span>
        {priceNote && <span className="text-xs text-muted-foreground">{priceNote}</span>}
      </span>
      <ChevronRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
    </a>
  );
}

export function ResultList({ children }) {
  return <div className="divide-y overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10">{children}</div>;
}
