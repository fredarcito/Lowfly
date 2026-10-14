import { useI18n } from "@/context/i18n";
import { heatOf } from "@/utils/format";
import { cn } from "@/utils/cn";

// Outbound × return table with the total price of each combination
export default function FlexMatrix({ outDays, retDays, combos, ida, vuelta, min, max }) {
  const { t, f } = useI18n();
  return (
    <div className="overflow-x-auto rounded-xl bg-card p-3 ring-1 ring-foreground/10 sm:p-4">
      <table className="border-separate border-spacing-1 tabular-nums">
        <thead>
          <tr>
            <th scope="col" className="px-2 text-left text-xs font-normal whitespace-nowrap text-muted-foreground">
              {t.results.matrixCorner}
            </th>
            {retDays.map((r) => (
              <th key={r} scope="col" className="px-1 text-xs font-medium whitespace-nowrap text-muted-foreground">
                {f.fmtShort(r)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {outDays.map((o) => (
            <tr key={o}>
              <th scope="row" className="pr-2 text-right text-xs font-medium whitespace-nowrap text-muted-foreground">
                {f.fmtShort(o)}
              </th>
              {retDays.map((r) => {
                const c = combos[`${o}|${r}`];
                const plan = o === ida && r === vuelta;
                const base = "h-11 min-w-14 rounded-md text-center font-heading text-sm font-extrabold";
                if (!c)
                  return (
                    <td key={r} className={cn(base, "bg-cell/50 font-normal text-muted-foreground", plan && "ring-2 ring-primary")}>
                      –
                    </td>
                  );
                const heat = heatOf(c.total, min, max);
                return (
                  <td
                    key={r}
                    className={cn(base, "heat", heat > 55 && "heat-hot", plan && "ring-2 ring-primary")}
                    style={{ "--heat": `${heat}%` }}
                    title={c.city}
                  >
                    {Math.round(c.total)}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
