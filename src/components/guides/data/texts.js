// The city guides' words (/es/guias/roma-3-dias) and their list (/es/guias), in each language. Every "make it
// yours" prompt names something the app's itinerary does and the guide cannot: dates, arrival time, pace,
// interests, more days.
// "3 días", but "1 día"
const daysEs = (days) => (days === 1 ? "1 día" : `${days} días`);
const daysEn = (days) => (days === 1 ? "1 day" : `${days} days`);

const es = {
  title: (city, days) => `Qué ver en ${city} en ${daysEs(days)}`,
  metaTitle: (city, days) => `Qué ver en ${city} en ${daysEs(days)}: itinerario día a día · Lowfly`,
  kicker: (days) => `Itinerario de ${daysEs(days)} · día a día`,
  photoAlt: (city) => `Vista de ${city}`,
  intro: {
    about: (city) => `Sobre ${city}`,
    stay: "Dónde alojarte",
    gettingAround: "Cómo moverte",
    bestTime: "Cuándo ir",
  },
  day: (number) => `Día ${number}`,
  stops: (count) => `${count} paradas`,
  roughTimes: "Horario orientativo",
  // The days' links above them
  days: "Días de la guía",
  types: { imprescindible: "Imprescindible", recomendado: "Recomendado", opcional: "Opcional" },
  // Under the title: when it was written ("octubre de 2026")
  updated: (date) => `Actualizada en ${date}`,
  // On each sight: how long it takes ("1 h 30 min") and what to look for there
  visitLength: (length) => `${length} de visita`,
  lookFor: "En qué fijarte",
  // What people ask about the city, answered with the guide itself (utils/guideFaq)
  faq: {
    title: (city) => `Preguntas frecuentes sobre ${city}`,
    days: {
      question: (city) => `¿Cuántos días hacen falta para ver ${city}?`,
      answer: (city, days, plan) =>
        days === 1
          ? `En un día ves lo esencial de ${city} si vas a buen ritmo. ${plan}`
          : `Con ${daysEs(days)} ves lo esencial de ${city} sin prisas. ${plan} Con más tiempo, puedes sumar excursiones cerca.`,
      plan: (number, title) => `Día ${number}: ${title}.`,
    },
    stay: (city) => `¿Dónde alojarse en ${city}?`,
    gettingAround: (city) => `¿Cómo moverse por ${city}?`,
    bestTime: (city) => `¿Cuál es la mejor época para ir a ${city}?`,
    mustSee: {
      question: (city) => `¿Qué es imprescindible ver en ${city}?`,
      answer: (places) => `Lo imprescindible en esta guía: ${places}.`,
    },
  },
  // Where each prompt shows: in the header, after day 1, after day 2, after the last day
  prompts: {
    hero: { button: "Personalizar este viaje" },
    afterFirstDay: {
      title: "¿A qué hora llegas?",
      text: (start) => `Esta guía empieza a las ${start}. Dinos tu vuelo y te creamos gratis un itinerario como este que empieza cuando aterrizas y tiene en cuenta tu check-in.`,
      button: "Adaptarlo a mi llegada",
    },
    afterSecondDay: {
      title: "¿Prefieres ir con calma o verlo todo?",
      text: "Esta guía va a un ritmo medio. Te creamos gratis un itinerario como este a tu ritmo y con lo que más te gusta: cultura, comida, naturaleza, vida nocturna, compras…",
      button: "Elegir mi ritmo",
    },
    afterLastDay: {
      title: (days) => (days === 1 ? "¿Tienes más de un día?" : `¿Tienes más de ${days} días, o menos?`),
      text: "Te creamos gratis un itinerario como este con los días que tengas y en tus fechas, con el tiempo que suele hacer y excursiones cerca.",
      button: "Crearlo con mis días",
    },
  },
  // Sharing a guide (the same dialog as a trip's)
  share: {
    title: "Compartir esta guía",
    text: "Cualquiera con el enlace puede verla, sin necesidad de cuenta.",
  },
  card: {
    title: (city) => `Tu itinerario de ${city}, a tu medida`,
    subtitle: "Esta guía es la misma para todos. El tuyo se hace para ti, en un par de minutos.",
    points: [
      "Tus fechas, tu ritmo y tus intereses",
      "Mapa interactivo y la ruta de cada día en Google Maps",
      "Qué pedir en cada comida y la historia de cada sitio",
      "Guárdalo, marca lo que ya visitaste y compártelo",
    ],
    button: "Crear mi itinerario",
  },
  list: {
    title: "Guías de viaje",
    metaTitle: "Guías de viaje: qué ver, día a día · Lowfly",
    metaDescription: "Itinerarios día a día por las ciudades de Europa: qué ver, dónde comer y cómo moverte. Y el tuyo, a tu medida.",
    intro: "Itinerarios día a día por las ciudades a las que vuelas: qué ver, dónde comer y cómo moverte.",
    days: daysEs,
    places: (count) => `${count} lugares`,
    explore: "¿A dónde te escapas?",
    search: "¿Qué ciudad quieres descubrir?",
    allCountries: "Todos los países",
    anyLength: "Todas",
    length: "Duración",
    country: "País",
    countrySearch: "Busca un país",
    noCountry: "No hay guías en ese país.",
    none: "No hay guías con esa búsqueda. Prueba con otra ciudad o crea tu itinerario a tu medida.",
    see: "Ver guía",
    band: {
      title: "¿Prefieres un viaje a tu medida?",
      text: "Crea tu itinerario con tus fechas, tu ritmo y lo que más te gusta.",
      button: "Crear itinerario",
    },
  },
  // On a route's page to the city
  routeLink: {
    title: (city) => `Qué ver en ${city}`,
    text: (city, days) => `Nuestro itinerario de ${daysEs(days)} por ${city}, día a día.`,
  },
};

const en = {
  title: (city, days) => `${city} in ${daysEn(days)}: what to see`,
  metaTitle: (city, days) => `${city} in ${daysEn(days)}: a day-by-day itinerary · Lowfly`,
  kicker: (days) => `${days}-day itinerary · day by day`,
  photoAlt: (city) => `View of ${city}`,
  intro: {
    about: (city) => `About ${city}`,
    stay: "Where to stay",
    gettingAround: "Getting around",
    bestTime: "When to go",
  },
  day: (number) => `Day ${number}`,
  stops: (count) => `${count} stops`,
  roughTimes: "Times are a rough guide",
  days: "The guide's days",
  types: { imprescindible: "Must see", recomendado: "Recommended", opcional: "Optional" },
  updated: (date) => `Updated ${date}`,
  visitLength: (length) => `${length} visit`,
  lookFor: "What to look for",
  faq: {
    title: (city) => `${city}: frequently asked questions`,
    days: {
      question: (city) => `How many days do you need in ${city}?`,
      answer: (city, days, plan) =>
        days === 1
          ? `One day is enough for the essentials of ${city} at a good pace. ${plan}`
          : `${daysEn(days)} are enough for the essentials of ${city} without rushing. ${plan} With more time, add day trips nearby.`,
      plan: (number, title) => `Day ${number}: ${title}.`,
    },
    stay: (city) => `Where to stay in ${city}?`,
    gettingAround: (city) => `How to get around ${city}?`,
    bestTime: (city) => `When is the best time to visit ${city}?`,
    mustSee: {
      question: (city) => `What are the must-sees in ${city}?`,
      answer: (places) => `This guide's must-sees: ${places}.`,
    },
  },
  prompts: {
    hero: { button: "Personalise this trip" },
    afterFirstDay: {
      title: "What time do you arrive?",
      text: (start) => `This guide starts at ${start}. Tell us your flight and we make you a free itinerary like this one that starts when you land and fits around your check-in.`,
      button: "Fit it to my arrival",
    },
    afterSecondDay: {
      title: "Taking it easy, or seeing it all?",
      text: "This guide goes at a steady pace. We make you a free itinerary like this one at your pace, with what you like most: culture, food, nature, nightlife, shopping…",
      button: "Pick my pace",
    },
    afterLastDay: {
      title: (days) => (days === 1 ? "More than one day?" : `More than ${days} days, or fewer?`),
      text: "We make you a free itinerary like this one with the days you have and on your dates, with the usual weather and nearby day trips.",
      button: "Make it with my days",
    },
  },
  share: {
    title: "Share this guide",
    text: "Anyone with the link can see it, no account needed.",
  },
  card: {
    title: (city) => `Your ${city} itinerary, made for you`,
    subtitle: "This guide is the same for everyone. Yours is made for you, in a couple of minutes.",
    points: [
      "Your dates, your pace and your interests",
      "An interactive map and each day's route in Google Maps",
      "What to order at every meal and the story of every sight",
      "Save it, tick off what you've seen and share it",
    ],
    button: "Create my itinerary",
  },
  list: {
    title: "Travel guides",
    metaTitle: "Travel guides: what to see, day by day · Lowfly",
    metaDescription: "Day-by-day itineraries for Europe's cities: what to see, where to eat and how to get around. And yours, made for you.",
    intro: "Day-by-day itineraries for the cities you fly to: what to see, where to eat and how to get around.",
    days: daysEn,
    places: (count) => `${count} places`,
    explore: "Where are you off to?",
    search: "Which city do you want to discover?",
    allCountries: "All countries",
    anyLength: "All",
    length: "Length",
    country: "Country",
    countrySearch: "Search a country",
    noCountry: "No guides in that country.",
    none: "No guides match that search. Try another city or make your own itinerary.",
    see: "See guide",
    band: {
      title: "Rather have a trip made for you?",
      text: "Make your itinerary with your dates, your pace and what you like most.",
      button: "Create itinerary",
    },
  },
  routeLink: {
    title: (city) => `What to see in ${city}`,
    text: (city, days) => `Our ${days}-day itinerary for ${city}, day by day.`,
  },
};

export const guideTexts = (lang) => (lang === "en" ? en : es);
