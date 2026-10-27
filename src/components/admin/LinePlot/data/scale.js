// The top of the scale: the first 1, 2 or 5 (× 10ⁿ) at or over the highest value; whole for counts
export const scaleTop = (highest, whole) => {
  if (highest <= 0) return whole ? 1 : 0.01;
  const power = 10 ** Math.floor(Math.log10(highest));
  const top = [1, 2, 5, 10].find((step) => step * power >= highest) * power;
  return whole ? Math.max(1, Math.ceil(top)) : top;
};
