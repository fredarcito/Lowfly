import { cn } from "@/utils/cn";

// A chart's lines, named beside a stroke of their colour (dashed as the line), with a figure each when given.
// `lines`: [{ key, label, color, dash?, value? }].
const ChartLegend = ({ lines }) => (
  <ul className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
    {lines.map((line) => (
      <li key={line.key} className="flex items-center gap-1.5">
        <span aria-hidden className={cn("w-3.5 border-t-2", line.dash && "border-dashed")} style={{ borderColor: line.color }} />
        {line.label}
        {line.value !== undefined && <span className="font-semibold text-foreground tabular-nums">{line.value}</span>}
      </li>
    ))}
  </ul>
);

export default ChartLegend;
