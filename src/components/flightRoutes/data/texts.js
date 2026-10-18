// The route pages' words (/es/flights/malta-barcelona) and their airport's page (/es/flights/malta), in each
// language. Prices are one way, per person.
const es = {
  title: (origin, city) => `Vuelos baratos de ${origin} a ${city}`,
  photoAlt: (city) => `Vista de ${city}`,
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
  // The questions people ask about a route, answered with its own figures (RoutePage/utils/routeFaq)
  faq: {
    title: (origin, city) => `Preguntas frecuentes sobre los vuelos de ${origin} a ${city}`,
    price: {
      question: (origin, city) => `¿Cuánto cuesta volar de ${origin} a ${city}?`,
      answer: (price, airline, day) =>
        `El vuelo más barato de los próximos seis meses cuesta ${price} solo ida por persona, con ${airline}, el ${day}. Incluye un bolso pequeño bajo el asiento; la maleta se paga aparte.`,
    },
    month: {
      question: (origin, city) => `¿Cuál es el mes más barato para volar de ${origin} a ${city}?`,
      answer: (month, price, next) =>
        `${month}, con vuelos desde ${price}.${next.length ? ` Le ${next.length === 1 ? "sigue" : "siguen"} ${next.map(([nextMonth, nextPrice]) => `${nextMonth} (desde ${nextPrice})`).join(" y ")}.` : ""}`,
    },
    airlines: {
      question: (origin, city) => `¿Qué aerolíneas vuelan directo de ${origin} a ${city}?`,
      answer: (airlines, count) =>
        `${count === 1 ? `Solo ${airlines} vuela` : `${airlines} vuelan`} directo en esta ruta. Reservas en la web de la aerolínea, sin intermediarios ni comisiones.`,
    },
    duration: {
      question: (origin, city) => `¿Cuánto dura el vuelo de ${origin} a ${city}?`,
      answer: (duration) => `Unas ${duration}, en vuelo directo y sin escalas.`,
    },
    airports: {
      question: (origin, city) => `¿A qué aeropuertos de ${city} se puede volar desde ${origin}?`,
      answer: (airports, city) => `${airports}. Cuando buscas ${city}, comparamos todos a la vez.`,
    },
    plan: {
      question: (city) => `¿Qué ver en ${city}?`,
      answer: (city, highlights) =>
        `${highlights ? `Destaca por ${highlights}. ` : ""}Si quieres, te creamos gratis un itinerario día a día de ${city} para tus fechas: qué ver, dónde comer y cómo moverte.`,
      link: "Crear itinerario",
    },
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
  photoAlt: (city) => `View of ${city}`,
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
  // The questions people ask about a route, answered with its own figures (RoutePage/utils/routeFaq)
  faq: {
    title: (origin, city) => `Frequently asked questions about flights from ${origin} to ${city}`,
    price: {
      question: (origin, city) => `How much does it cost to fly from ${origin} to ${city}?`,
      answer: (price, airline, day) =>
        `The cheapest flight in the next six months costs ${price} one way per person, with ${airline}, on ${day}. It includes a small bag under the seat; a suitcase costs extra.`,
    },
    month: {
      question: (origin, city) => `What is the cheapest month to fly from ${origin} to ${city}?`,
      answer: (month, price, next) =>
        `${month}, with flights from ${price}.${next.length ? ` Then ${next.map(([nextMonth, nextPrice]) => `${nextMonth} (from ${nextPrice})`).join(" and ")}.` : ""}`,
    },
    airlines: {
      question: (origin, city) => `Which airlines fly direct from ${origin} to ${city}?`,
      answer: (airlines, count) =>
        `${count === 1 ? `Only ${airlines} flies` : `${airlines} fly`} direct on this route. You book on the airline's own site, with no middlemen or fees.`,
    },
    duration: {
      question: (origin, city) => `How long is the flight from ${origin} to ${city}?`,
      answer: (duration) => `About ${duration}, direct and non-stop.`,
    },
    airports: {
      question: (origin, city) => `Which airports in ${city} can you fly to from ${origin}?`,
      answer: (airports, city) => `${airports}. When you search for ${city}, we compare them all at once.`,
    },
    plan: {
      question: (city) => `What to see in ${city}?`,
      answer: (city, highlights) =>
        `${highlights ? `Known for ${highlights}. ` : ""}If you like, we make you a free day-by-day itinerary of ${city} for your dates: what to see, where to eat and how to get around.`,
      link: "Create itinerary",
    },
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
