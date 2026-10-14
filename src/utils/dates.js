// Dates as "YYYY-MM-DD" strings in local time, to avoid timezone headaches
export const pad = (n) => String(n).padStart(2, "0");
export const iso = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export const isDay = (s) => /^\d{4}-\d{2}-\d{2}$/.test(s || "");
export const parseDay = (s) => {
  const [y, m, d] = s.slice(0, 10).split("-").map(Number);
  return new Date(y, m - 1, d);
};
export const addDays = (d, n) => {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
};
export const shift = (day, n) => iso(addDays(parseDay(day), n));
export const later = (a, b) => (a > b ? a : b);
export const today = () => iso(new Date());
export const tomorrow = () => iso(addDays(new Date(), 1));
export const nightsBetween = (a, b) => Math.round((parseDay(b) - parseDay(a)) / 864e5);

export const nextFriday = () => {
  let d = parseDay(tomorrow());
  while (d.getDay() !== 5) d = addDays(d, 1);
  return iso(d);
};

export const daysBetween = (from, to) => {
  const list = [];
  for (let d = from; d <= to; d = shift(d, 1)) list.push(d);
  return list;
};

export const monthsBetween = (from, to) => {
  let [y, m] = from.split("-").map(Number);
  const [y2, m2] = to.split("-").map(Number);
  const list = [];
  while (y < y2 || (y === y2 && m <= m2)) {
    list.push(`${y}-${pad(m)}-01`);
    if (++m > 12) { m = 1; y++; }
  }
  return list;
};

// Splits a range into chunks of at most `size` days
export const chunks = (from, to, size) => {
  const list = [];
  for (let s = from; s <= to; s = shift(s, size)) {
    const e = shift(s, size - 1);
    list.push([s, e < to ? e : to]);
  }
  return list;
};
