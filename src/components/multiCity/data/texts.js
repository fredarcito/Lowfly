// The multi-city routes' own pages' words (/es/recorridos/italia-clasica), in each language. The route's own text
// (what each town is like) is in src/data/multiCityPages/<route>.json; these are the page's frame.
const es = {
  // The way to the page, for search engines: Lowfly › Recorridos › the route
  section: "Recorridos",
  kicker: (min, max) => `Recorrido · de ${min} a ${max} días`,
  photoAlt: (name) => `Paisaje del recorrido ${name}`,
  updated: (date) => `Actualizado en ${date}`,
  why: "Por qué este recorrido",
  versions: {
    title: "Elige cuántos días",
    aria: "Duración del recorrido",
    names: { short: "Corto", full: "Completo", long: "Largo" },
    days: (min, ideal) => (min === ideal ? `${min} días` : `${min}–${ideal} días`),
    recommended: "El que recomendamos",
    landNote: "Los tiempos por tierra son orientativos.",
  },
  towns: "Las ciudades",
  nights: (count) => (count === 1 ? "1 noche" : `${count} noches`),
  // A town not in every version: in which ones (`name`: the version's, versions.names)
  onlyIn: (name) => `solo en el ${name.toLowerCase()}`,
  fromVersion: (name) => `desde el ${name.toLowerCase()}`,
  see: "Qué ver",
  tip: "Consejo",
  // Between two towns: "1 h 35 min en tren hasta Bolonia" (`duration`: utils/format duration)
  landTo: (duration, by, city) => `${duration} en ${by} hasta ${city}`,
  land: { train: "tren", bus: "bus", ferry: "ferri", car: "coche" },
  photoOf: (city) => `Vista de ${city}`,
  guide: (city, days) => `Guía: qué ver en ${city} en ${days === 1 ? "1 día" : `${days} días`}`,
  gettingAround: "Cómo moverse entre ciudades",
  bestTime: "Cuándo ir",
  faq: "Preguntas frecuentes",
  search: "Ver vuelos para recorridos así",
  card: {
    title: "¿Te apetece un viaje así?",
    subtitle: "Dinos desde dónde sales y qué días tienes libres: te buscamos recorridos como este con vuelos reales.",
    points: [
      "Vuelas a una ciudad y vuelves desde otra",
      "Los días que tengas, de 5 a 15",
      "El precio real, directo con la aerolínea",
      "Y tu itinerario día a día, si lo quieres",
    ],
    button: "Descubre más recorridos como este al mejor precio",
  },
  share: {
    title: "Compartir este recorrido",
    text: "Cualquiera con el enlace puede verlo, sin necesidad de cuenta.",
  },
  // On a city guide whose city is in a route with a page
  guideLink: {
    title: (city, name) => `${city} forma parte del recorrido ${name}`,
    text: (towns, min, max) => `${towns}, en un mismo viaje de ${min} a ${max} días.`,
    action: "Ver el recorrido",
  },
};

const en = {
  section: "Multi-city routes",
  kicker: (min, max) => `Route · ${min} to ${max} days`,
  photoAlt: (name) => `Scenery on the ${name} route`,
  updated: (date) => `Updated ${date}`,
  why: "Why this route",
  versions: {
    title: "Choose how many days",
    aria: "Route length",
    names: { short: "Short", full: "Full", long: "Long" },
    days: (min, ideal) => (min === ideal ? `${min} days` : `${min}–${ideal} days`),
    recommended: "Our pick",
    landNote: "Times overland are approximate.",
  },
  towns: "The cities",
  nights: (count) => (count === 1 ? "1 night" : `${count} nights`),
  onlyIn: (name) => `${name} version only`,
  fromVersion: (name) => `from the ${name.toLowerCase()} version`,
  see: "What to see",
  tip: "Tip",
  landTo: (duration, by, city) => `${duration} by ${by} to ${city}`,
  land: { train: "train", bus: "bus", ferry: "ferry", car: "car" },
  photoOf: (city) => `View of ${city}`,
  guide: (city, days) => `Guide: ${city} in ${days === 1 ? "1 day" : `${days} days`}`,
  gettingAround: "Getting between cities",
  bestTime: "When to go",
  faq: "Frequently asked questions",
  search: "See flights for routes like this",
  card: {
    title: "Fancy a trip like this?",
    subtitle: "Tell us where you fly from and which days you're free: we find routes like this one with real flights.",
    points: [
      "Fly into one city and home from another",
      "The days you have, from 5 to 15",
      "The real price, straight from the airline",
      "And your day-by-day itinerary, if you want it",
    ],
    button: "Discover more routes like this at the best price",
  },
  share: {
    title: "Share this route",
    text: "Anyone with the link can see it, no account needed.",
  },
  guideLink: {
    title: (city, name) => `${city} is part of the ${name} route`,
    text: (towns, min, max) => `${towns}, in one trip of ${min} to ${max} days.`,
    action: "See the route",
  },
};

export const routePageTexts = (lang) => (lang === "en" ? en : es);
