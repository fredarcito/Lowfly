// One end of a flight: time, airport code and city
const End = ({ time, airport, align = "left" }) => {
  return (
    <div className={align === "right" ? "grid text-right" : "grid"}>
      <span className="font-heading text-xl font-bold tabular-nums sm:text-2xl">{time || "—"}</span>
      <span className="text-xs font-semibold tracking-wider">{airport.code}</span>
      {airport.city && <span className="truncate text-xs text-muted-foreground">{airport.city}</span>}
    </div>
  );
};

export default End;
