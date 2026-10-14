// Approximate prices of a bag on one flight, bought online with the ticket (third-party fee guides,
// October 2026). The fares only include a small bag under the seat; the airlines change these prices with
// the route and the date, so they are only shown as a "from" estimate (utils/baggage). Update them when the
// fees change.
// - cabin: a 10 kg trolley in the cabin (Ryanair and Wizz sell it as "Priority")
// - checked: a 20 kg checked bag
export const BAGS = {
  cabin: { kg: 10, from: { ryanair: 12, wizz: 5 } },
  checked: { kg: 20, from: { ryanair: 21, wizz: 13 } },
};
