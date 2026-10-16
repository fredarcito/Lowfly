import { searchToParams } from "@/utils/share";
import { later, shift, tomorrow } from "@/utils/dates";

// The search for this route already filled in (one way, to the city, its airports together): for a month
// ("2026-11"), or the next three months
export const searchLink = (lang, route, month) => {
  const first = tomorrow();
  const from = month ? later(`${month}-01`, first) : first;
  const to = month ? shift(`${month}-01`, new Date(Date.UTC(Number(month.slice(0, 4)), Number(month.slice(5, 7)), 0)).getUTCDate() - 1) : shift(first, 90);
  const params = searchToParams({ origin: route.origin.code, country: route.country, city: route.city, from, to, trip: "oneway" }, "country");
  return `/${lang}?${params}`;
};
