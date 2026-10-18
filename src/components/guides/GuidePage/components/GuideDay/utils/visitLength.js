// How long a stop lasts, from its time ("10:30–12:30" → "2 h", "09:00–10:30" → "1 h 30 min", "14:00–14:45" →
// "45 min"), or null when it has no end or the end is not after the start
export const visitLength = (time) => {
  const [start, end] = (time?.match(/\d{1,2}:\d{2}/g) ?? []).map((clock) => {
    const [hours, minutes] = clock.split(":").map(Number);
    return hours * 60 + minutes;
  });
  if (start == null || end == null || end <= start) return null;
  const hours = Math.floor((end - start) / 60);
  const minutes = (end - start) % 60;
  if (!hours) return `${minutes} min`;
  return minutes ? `${hours} h ${minutes} min` : `${hours} h`;
};
