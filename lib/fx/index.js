// Euro exchange rates (ExchangeRate-API open access, updated daily). Only called from the server.
// Wizz Air prices come in the departure airport's currency (HUF, GEL, AED…); Ryanair's are already in euros.
// The ECB does not publish many of those currencies, hence this source.
export async function eurRates() {
  const r = await fetch("https://open.er-api.com/v6/latest/EUR", { next: { revalidate: 43200 } });
  if (!r.ok) throw new Error(`ExchangeRate-API responded with error ${r.status}`);
  return (await r.json()).rates;
}

// Converts fares ({ price, cur }) to euros. Throws if a currency is unknown, so prices are never mixed.
export async function toEur(fares) {
  if (fares.every((f) => f.cur === "EUR")) return fares;
  const fx = await eurRates();
  return fares.map((f) => {
    if (!fx[f.cur]) throw new Error(`No exchange rate for ${f.cur}`);
    return { ...f, price: Math.round((f.price / fx[f.cur]) * 100) / 100, cur: "EUR" };
  });
}
