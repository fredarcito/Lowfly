// One headline figure: what it is, the number, and an optional line under it
const StatTile = ({ label, value, hint }) => (
  <div className="grid content-start gap-1 rounded-xl bg-card p-5 ring-1 ring-foreground/10">
    <dt className="text-sm text-muted-foreground">{label}</dt>
    <dd className="font-heading text-3xl font-extrabold tracking-tight tabular-nums">{value}</dd>
    {hint && <dd className="text-xs text-muted-foreground">{hint}</dd>}
  </div>
);

export default StatTile;
