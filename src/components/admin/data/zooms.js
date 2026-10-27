// The trend charts' zooms: how many days each shows (the last ones, up to today) and how many go into each point: a
// week and a month day by day, a year week by week
export const ZOOMS = { week: { days: 7, step: 1 }, month: { days: 30, step: 1 }, year: { days: 364, step: 7 } };
export const ZOOM_OPTIONS = Object.keys(ZOOMS);

// How a zoom's points are dated: in the tooltip (a day, or a week "21 oct – 27 oct") and under the lines (a day, or
// the month for weeks: "oct 2026")
export const zoomDates = (zoom, format) => {
  const weekly = ZOOMS[zoom].step > 1;
  return {
    labelOf: (point) => (weekly ? `${format.day(point.from)} – ${format.day(point.to)}` : format.day(point.from)),
    axisOf: (point, last) => (weekly ? format.month(last ? point.to : point.from) : format.day(point.from)),
  };
};
