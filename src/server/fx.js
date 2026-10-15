// Euro exchange rates (ExchangeRate-API open access, updated daily). Only called from the server.
// Wizz Air prices come in the departure airport's currency (HUF, GEL, AED…); Ryanair's are already in euros.
// The ECB does not publish many of those currencies, hence this source.
export const eurRates = async () => {
  const response = await fetch("https://open.er-api.com/v6/latest/EUR", { next: { revalidate: 43200 } });
  if (!response.ok) throw new Error(`ExchangeRate-API responded with error ${response.status}`);
  return (await response.json()).rates;
};

// Converts fares ({ price, cur }) to euros. Throws if a currency is unknown, so prices are never mixed.
export const toEur = async (fares) => {
  if (fares.every((fare) => fare.cur === "EUR")) return fares;
  const fx = await eurRates();
  return fares.map((fare) => {
    if (!fx[fare.cur]) throw new Error(`No exchange rate for ${fare.cur}`);
    return { ...fare, price: Math.round((fare.price / fx[fare.cur]) * 100) / 100, cur: "EUR" };
  });
};
