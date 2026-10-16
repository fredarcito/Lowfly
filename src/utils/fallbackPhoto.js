// A generic travel photo for a destination without one of its own: a wing or clouds seen from the plane, never a
// place (it would pass for the destination). CC0 photos from Unsplash (through Wikimedia Commons), kept in
// public/fallback at 800 and 1600 px wide, so they need no credit and never fail to load.
const NAMES = ["sky", "dusk", "sun", "clouds"];

const pathOf = (name, width) => `/fallback/travel-${name}-${width}.webp`;

// Always the same one for the same destination (`key`: its airport code or town), so two cards side by side
// rarely match: { src, srcSet }
export const fallbackPhoto = (key = "") => {
  const hash = [...key].reduce((total, character) => (total * 31 + character.charCodeAt(0)) >>> 0, 0);
  const name = NAMES[hash % NAMES.length];
  return { src: pathOf(name, 800), srcSet: `${pathOf(name, 800)} 800w, ${pathOf(name, 1600)} 1600w` };
};
