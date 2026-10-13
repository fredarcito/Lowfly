import { useI18n } from "@/components/I18nProvider";

// Heat map legend: from cheapest (yellow) to most expensive
export default function HeatLegend({ min, max, extra }) {
  const { f } = useI18n();
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
      <span className="flex items-center gap-2">
        <span className="tabular-nums">{f.money(min)}</span>
        <span
          className="h-2.5 w-24 rounded-full"
          style={{ background: "linear-gradient(90deg, var(--sun), color-mix(in oklab, var(--sun) 15%, var(--cell)))" }}
          aria-hidden
        />
        <span className="tabular-nums">{f.money(max)}</span>
      </span>
      {extra}
    </div>
  );
}
