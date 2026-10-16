import { adminTexts } from "@/components/admin/data/texts";
import { adminFormat } from "@/components/admin/data/format";

// Every AI call behind the account's itineraries, newest first: when, where, the model, tokens and cost.
// Scrolls sideways on its own on phones (the page does not).
const UsageTable = ({ calls, lang }) => {
  const texts = adminTexts(lang).user;
  const formats = adminFormat(lang);
  const columns = texts.usageColumns;
  if (!calls.length) return <p className="text-sm text-muted-foreground">{texts.noUsage}</p>;
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[40rem] text-sm">
        <thead className="text-left text-xs text-muted-foreground">
          <tr className="border-b">
            <th scope="col" className="py-2 pr-3 font-medium">{columns.date}</th>
            <th scope="col" className="py-2 pr-3 font-medium">{columns.destination}</th>
            <th scope="col" className="py-2 pr-3 text-right font-medium">{columns.days}</th>
            <th scope="col" className="py-2 pr-3 font-medium">{columns.model}</th>
            <th scope="col" className="py-2 pr-3 text-right font-medium">{columns.tokens}</th>
            <th scope="col" className="py-2 text-right font-medium">{columns.cost}</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {calls.map((call) => (
            <tr key={`${call.request_id}-${call.city}-${call.created_at}`}>
              <td className="py-2 pr-3 whitespace-nowrap">{formats.date(call.created_at, true)}</td>
              <td className="py-2 pr-3">
                {call.city}
                {call.country && <span className="text-muted-foreground">, {call.country}</span>}
              </td>
              <td className="py-2 pr-3 text-right tabular-nums">{call.days}</td>
              <td className="py-2 pr-3 whitespace-nowrap">{call.model}</td>
              <td className="py-2 pr-3 text-right whitespace-nowrap tabular-nums">
                {formats.count(call.input_tokens ?? 0)} / {formats.count(call.output_tokens ?? 0)}
              </td>
              <td className="py-2 text-right tabular-nums">{formats.money(call.cost)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UsageTable;
