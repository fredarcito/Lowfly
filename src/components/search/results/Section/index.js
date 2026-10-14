// Results block with a title and an optional note
export default function Section({ title, note, action, children }) {
  return (
    <section className="grid gap-3">
      <div className="flex flex-wrap items-end justify-between gap-x-4 gap-y-2">
        <div className="grid gap-0.5">
          <h2 className="font-heading text-xl font-bold tracking-tight">{title}</h2>
          {note && <p className="max-w-[65ch] text-sm text-muted-foreground">{note}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}
