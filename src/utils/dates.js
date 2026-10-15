// Dates as "YYYY-MM-DD" strings in local time, to avoid timezone headaches
export const pad = (number) => String(number).padStart(2, "0");
export const iso = (date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
export const isDay = (text) => /^\d{4}-\d{2}-\d{2}$/.test(text || "");
export const parseDay = (text) => {
  const [year, month, dayOfMonth] = text.slice(0, 10).split("-").map(Number);
  return new Date(year, month - 1, dayOfMonth);
};
const addDays = (date, days) => {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + days);
  return copy;
};
export const shift = (day, days) => iso(addDays(parseDay(day), days));
export const later = (first, second) => (first > second ? first : second);
export const today = () => iso(new Date());
export const tomorrow = () => iso(addDays(new Date(), 1));
export const nightsBetween = (from, to) => Math.round((parseDay(to) - parseDay(from)) / 864e5);

export const nextFriday = () => {
  let date = parseDay(tomorrow());
  while (date.getDay() !== 5) date = addDays(date, 1);
  return iso(date);
};

export const daysBetween = (from, to) => {
  const list = [];
  for (let day = from; day <= to; day = shift(day, 1)) list.push(day);
  return list;
};

export const monthsBetween = (from, to) => {
  let [year, month] = from.split("-").map(Number);
  const [y2, m2] = to.split("-").map(Number);
  const list = [];
  while (year < y2 || (year === y2 && month <= m2)) {
    list.push(`${year}-${pad(month)}-01`);
    if (++month > 12) { month = 1; year++; }
  }
  return list;
};

// Splits a range into chunks of at most `size` days
export const chunks = (from, to, size) => {
  const list = [];
  for (let start = from; start <= to; start = shift(start, size)) {
    const end = shift(start, size - 1);
    list.push([start, end < to ? end : to]);
  }
  return list;
};
