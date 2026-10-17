// The route pages' words (/es/flights/malta-barcelona) and their airport's page (/es/flights/malta), in each
// language. Prices are one way, per person.
const es = {
  title: (origin, city) => `Vuelos baratos de ${origin} a ${city}`,
  metaTitle: (origin, city, price) => `Vuelos baratos de ${origin} a ${city}${price ? ` desde ${price}` : ""} · Lowfly`,
  metaDescription: (origin, city, price, airlines) =>
    `${price ? `Vuelos de ${origin} a ${city} desde ${price}` : `Vuelos de ${origin} a ${city}`} con ${airlines}. Mira el mes más barato, compara fechas y reserva directo con la aerolínea, sin comisiones.`,
  from: "Desde",
  oneWay: "Solo ida · 1 adulto",
  direct: "Directo",
  searchDates: "Ver fechas y precios",
  byMonth: "Cuándo es más barato volar",
  byMonthHint: "Solo ida, por persona. Toca un mes para buscar sus fechas.",
  updated: "Precios consultados cada día en la web de cada aerolínea.",
  facts: "Ficha de la ruta",
  airlines: "Aerolínea",
  origin: "Origen",
  destination: "Destino",
  duration: "Duración del vuelo",
  flightType: "Tipo de vuelo",
  cheapestMonth: "Mes más barato",
  whyGo: (city) => `Por qué ir a ${city}`,
  source: "Fuente",
  plan: {
    title: "¿Planeas tu viaje?",
    subtitle: (city) => `Te creamos el itinerario de ${city} a tu medida.`,
    points: ["Un plan día a día", "Qué ver y hacer", "Dónde comer", "La ruta de cada día en Google Maps"],
    button: "Crear itinerario",
  },
  others: (origin) => `Más destinos desde ${origin}`,
  othersHint: (origin) => `Vuelos baratos desde ${origin}, directos con la aerolínea.`,
  seeAll: "Ver todos los destinos",
  noPrices: "Ahora mismo no hay precios para esta ruta en los próximos meses. Prueba a buscar otras fechas o destinos.",
  regions: {
    south: "Europa del Sur",
    west: "Europa Occidental",
    central: "Europa Central",
    north: "Norte de Europa",
    east: "Europa del Este y Balcanes",
    beyond: "Fuera de Europa",
  },
  originPage: {
    title: (origin) => `Vuelos baratos desde ${origin}`,
    metaTitle: (origin, count) => `Vuelos baratos desde ${origin} a ${count} destinos · Lowfly`,
    metaDescription: (origin, count, price) =>
      `${count} destinos con vuelo directo desde ${origin}${price ? `, desde ${price}` : ""}. Precios de hoy de Ryanair y Wizz Air y reserva directo con la aerolínea, sin comisiones.`,
    intro: (count) => `${count} destinos con vuelo directo. El precio es el vuelo más barato de los próximos tres meses, solo ida.`,
  },
  airportsPage: {
    title: "Vuelos baratos por aeropuerto",
    metaTitle: "Vuelos baratos por aeropuerto · Lowfly",
    metaDescription: (count) =>
      `Vuelos directos y baratos desde ${count} aeropuertos. Precios de hoy de Ryanair y Wizz Air y reserva directo con la aerolínea, sin comisiones.`,
    intro: (count) => `Elige desde dónde sales: ${count} aeropuertos, cada uno con todos sus destinos directos y sus precios de hoy.`,
  },
};

const en = {
  title: (origin, city) => `Cheap flights from ${origin} to ${city}`,
  metaTitle: (origin, city, price) => `Cheap flights from ${origin} to ${city}${price ? ` from ${price}` : ""} · Lowfly`,
  metaDescription: (origin, city, price, airlines) =>
    `${price ? `Flights from ${origin} to ${city} from ${price}` : `Flights from ${origin} to ${city}`} with ${airlines}. See the cheapest month, compare dates and book straight with the airline, no fees.`,
  from: "From",
  oneWay: "One way · 1 adult",
  direct: "Direct",
  searchDates: "See dates and prices",
  byMonth: "When it is cheapest to fly",
  byMonthHint: "One way, per person. Tap a month to search its dates.",
  updated: "Prices checked every day on each airline's site.",
  facts: "About the route",
  airlines: "Airline",
  origin: "From",
  destination: "To",
  duration: "Flight time",
  flightType: "Flight",
  cheapestMonth: "Cheapest month",
  whyGo: (city) => `Why go to ${city}`,
  source: "Source",
  plan: {
    title: "Planning your trip?",
    subtitle: (city) => `We make your ${city} itinerary, made for you.`,
    points: ["A day-by-day plan", "What to see and do", "Where to eat", "Each day's route in Google Maps"],
    button: "Create itinerary",
  },
  others: (origin) => `More destinations from ${origin}`,
  othersHint: (origin) => `Cheap flights from ${origin}, booked straight with the airline.`,
  seeAll: "See all destinations",
  noPrices: "There are no prices for this route in the coming months right now. Try other dates or destinations.",
  regions: {
    south: "Southern Europe",
    west: "Western Europe",
    central: "Central Europe",
    north: "Northern Europe",
    east: "Eastern Europe and the Balkans",
    beyond: "Beyond Europe",
  },
  originPage: {
    title: (origin) => `Cheap flights from ${origin}`,
    metaTitle: (origin, count) => `Cheap flights from ${origin} to ${count} destinations · Lowfly`,
    metaDescription: (origin, count, price) =>
      `${count} destinations with a direct flight from ${origin}${price ? `, from ${price}` : ""}. Today's Ryanair and Wizz Air prices, booked straight with the airline, no fees.`,
    intro: (count) => `${count} destinations with a direct flight. The price is the cheapest flight of the next three months, one way.`,
  },
  airportsPage: {
    title: "Cheap flights by airport",
    metaTitle: "Cheap flights by airport · Lowfly",
    metaDescription: (count) =>
      `Cheap direct flights from ${count} airports. Today's Ryanair and Wizz Air prices, booked straight with the airline, no fees.`,
    intro: (count) => `Pick where you fly from: ${count} airports, each with every direct destination and today's prices.`,
  },
};

export const routeTexts = (lang) => (lang === "en" ? en : es);
