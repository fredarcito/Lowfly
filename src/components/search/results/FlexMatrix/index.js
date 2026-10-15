import { useI18n } from "@/context/i18n";
import { heatOf } from "@/utils/format";
import { cn } from "@/utils/cn";

// Outbound × return table with the total price of each combination
const FlexMatrix = ({ outDays, retDays, combos, ida, vuelta, min, max }) => {
  const { texts, format } = useI18n();
  return (
    <div className="overflow-x-auto rounded-xl bg-card p-3 ring-1 ring-foreground/10 sm:p-4">
      <table className="border-separate border-spacing-1 tabular-nums">
        <thead>
          <tr>
            <th scope="col" className="px-2 text-left text-xs font-normal whitespace-nowrap text-muted-foreground">
              {texts.results.matrixCorner}
            </th>
            {retDays.map((returnDay) => (
              <th key={returnDay} scope="col" className="px-1 text-xs font-medium whitespace-nowrap text-muted-foreground">
                {format.fmtShort(returnDay)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {outDays.map((outDay) => (
            <tr key={outDay}>
              <th scope="row" className="pr-2 text-right text-xs font-medium whitespace-nowrap text-muted-foreground">
                {format.fmtShort(outDay)}
              </th>
              {retDays.map((returnDay) => {
                const combo = combos[`${outDay}|${returnDay}`];
                const plan = outDay === ida && returnDay === vuelta;
                const base = "h-11 min-w-14 rounded-md text-center font-heading text-sm font-extrabold";
                if (!combo)
                  return (
                    <td key={returnDay} className={cn(base, "bg-cell/50 font-normal text-muted-foreground", plan && "ring-2 ring-primary")}>
                      –
                    </td>
                  );
                const heat = heatOf(combo.total, min, max);
                return (
                  <td
                    key={returnDay}
                    className={cn(base, "heat", heat > 55 && "heat-hot", plan && "ring-2 ring-primary")}
                    style={{ "--heat": `${heat}%` }}
                    title={combo.city}
                  >
                    {Math.round(combo.total)}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default FlexMatrix;
