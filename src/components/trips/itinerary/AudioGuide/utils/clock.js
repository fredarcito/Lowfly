// Seconds as a player shows them: 0:38, 2:05
export const formatClock = (totalSeconds) => {
  const seconds = Math.max(0, Math.floor(totalSeconds || 0));
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
};
