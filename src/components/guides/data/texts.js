// The city guides' words (/es/guides/rome-3-days) and their list (/es/guides), in each language. Every "make it
// yours" prompt names something the app's itinerary does and the guide cannot: dates, arrival time, pace,
// interests, more days.
const es = {
  title: (city, days) => `Qué ver en ${city} en ${days} días`,
  metaTitle: (city, days) => `Qué ver en ${city} en ${days} días: itinerario día a día · Lowfly`,
  kicker: (days) => `Itinerario de ${days} días · día a día`,
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
  // Where each prompt shows: in the header, after day 1, after day 2, after the last day
  prompts: {
    hero: { button: "Personalizar este viaje" },
    afterFirstDay: {
      title: "¿Llegas a media tarde?",
      text: "Crea el tuyo y lo ajustamos a la hora a la que aterriza tu vuelo y a la de tu check-in.",
      button: "Adaptarlo a mi llegada",
    },
    afterSecondDay: {
      title: "¿Prefieres ir con calma o verlo todo?",
      text: "Crea el tuyo a tu ritmo y con lo que más te gusta: cultura, comida, naturaleza, vida nocturna, compras…",
      button: "Elegir mi ritmo",
    },
    afterLastDay: {
      title: (days) => `¿Tienes más de ${days} días, o menos?`,
      text: "Crea el tuyo con los días que tengas y en tus fechas: con el tiempo que suele hacer y excursiones cerca.",
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
    days: (days) => `${days} días`,
    explore: "Explora las guías",
    search: "¿Qué ciudad quieres descubrir?",
    allCountries: "Todos los países",
    anyLength: "Cualquier duración",
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
    text: (city, days) => `Nuestro itinerario de ${days} días por ${city}, día a día.`,
  },
};

const en = {
  title: (city, days) => `${city} in ${days} days: what to see`,
  metaTitle: (city, days) => `${city} in ${days} days: a day-by-day itinerary · Lowfly`,
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
  prompts: {
    hero: { button: "Personalise this trip" },
    afterFirstDay: {
      title: "Arriving in the afternoon?",
      text: "Make your own and we fit it to when your flight lands and to your check-in.",
      button: "Fit it to my arrival",
    },
    afterSecondDay: {
      title: "Taking it easy, or seeing it all?",
      text: "Make your own at your pace, with what you like most: culture, food, nature, nightlife, shopping…",
      button: "Pick my pace",
    },
    afterLastDay: {
      title: (days) => `More than ${days} days, or fewer?`,
      text: "Make your own with the days you have and on your dates: with the usual weather and nearby day trips.",
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
    days: (days) => `${days} days`,
    explore: "Explore the guides",
    search: "Which city do you want to discover?",
    allCountries: "All countries",
    anyLength: "Any length",
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
