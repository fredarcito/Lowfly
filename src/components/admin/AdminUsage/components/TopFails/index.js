import { adminTexts } from "@/components/admin/data/texts";
import { adminFormat } from "@/components/admin/data/format";

// The errors searches ended with, most frequent first, each with the kinds of search it happened in: where the search
// fails people. `searches`: [{ mode, fails: { code: count } }].
const TopFails = ({ searches, lang }) => {
  const texts = adminTexts(lang).usage;
  const formats = adminFormat(lang);
  const byCode = new Map();
  for (const search of searches)
    for (const [code, count] of Object.entries(search.fails)) {
      const known = byCode.get(code) ?? { code, count: 0, modes: [] };
      byCode.set(code, { ...known, count: known.count + count, modes: [...known.modes, texts.modes[search.mode]] });
    }
  const fails = [...byCode.values()].sort((first, second) => second.count - first.count);
  return (
    <section className="grid content-start gap-5 self-start rounded-xl bg-card p-5 ring-1 ring-foreground/10 sm:p-6">
      <h2 className="font-heading text-lg font-bold">{texts.topFails}</h2>
      {fails.length === 0 ? (
        <p className="text-sm text-muted-foreground">{texts.noFails}</p>
      ) : (
        <ol className="grid gap-3">
          {fails.map((fail) => (
            <li key={fail.code} className="flex items-baseline justify-between gap-3 text-sm">
              <span className="grid min-w-0">
                <span className="font-medium">{texts.fails[fail.code] ?? fail.code}</span>
                <span className="truncate text-xs text-muted-foreground">{fail.modes.join(" · ")}</span>
              </span>
              <span className="font-semibold tabular-nums">{formats.count(fail.count)}</span>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
};

export default TopFails;
