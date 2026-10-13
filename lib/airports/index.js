// Every airport you can fly from with Ryanair or Wizz Air. Only called from the server.
import * as ryanair from "@/lib/ryanair";
import * as wizz from "@/lib/wizz";

export async function getAirports(lang = "es") {
  const [ry, wz] = await Promise.allSettled([ryanair.airports(lang), wizz.airports(lang)]);
  const byCode = new Map();
  // Ryanair first: its data is richer (time zone, the country's main airport)
  for (const { airline, ...a } of [...(ry.value || []), ...(wz.value || [])]) {
    const e = byCode.get(a.code);
    if (e) e.airlines.push(airline);
    else byCode.set(a.code, { ...a, airlines: [airline] });
  }
  if (!byCode.size) throw new Error("No airline returned its airports");
  return { airports: [...byCode.values()] };
}
