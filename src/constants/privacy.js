// The privacy policy (/es/privacy, /en/privacy): what Lowfly keeps, where and why, in both languages.
// It describes what the code does; change it whenever that changes (and the date).
// Each section: a title and paragraphs or lists (an array is a bulleted list).
export const PRIVACY_UPDATED = "2026-10-15";
// Where people write about their data or the terms (shown on both legal pages)
export const CONTACT_EMAIL = "fredar21@gmail.com";

export const PRIVACY = {
  es: {
    title: "Política de privacidad",
    intro:
      "Lowfly te ayuda a encontrar vuelos baratos y a planear tu viaje. Esta página explica qué datos tuyos usamos, para qué y con quién los compartimos. Lo resumimos en una frase: guardamos lo mínimo para que la app funcione y nunca vendemos tus datos.",
    updated: (date) => `Última actualización: ${date}`,
    sections: [
      {
        title: "Sin cuenta",
        body: [
          "Puedes buscar vuelos y guardar viajes sin registrarte. En ese caso:",
          [
            "Tus viajes, itinerarios y preferencias (aeropuerto de salida, tema claro u oscuro) se guardan solo en tu navegador (localStorage). No los recibimos.",
            "Para proponerte un aeropuerto de salida en la primera visita usamos el país de tu conexión y la zona horaria de tu navegador. No los guardamos.",
            "El botón «Usar mi ubicación» calcula el aeropuerto más cercano dentro de tu navegador: tu posición no se envía a nuestros servidores.",
          ],
        ],
      },
      {
        title: "Con cuenta",
        body: [
          "Si entras con Google o con un enlace por email, guardamos:",
          [
            "Tu email y, si usas Google, tu nombre y tu foto de perfil, para identificarte y mostrar tu cuenta.",
            "Tus viajes: los vuelos que guardas o los viajes que planeas a mano, sus itinerarios, tus preferencias y las paradas que marcas como visitadas, para que los tengas en todos tus dispositivos.",
          ],
          "Al entrar, los viajes que ya tenías en ese navegador se añaden a tu cuenta. Al cerrar sesión, se borran del navegador y siguen en tu cuenta.",
        ],
      },
      {
        title: "Itinerarios con inteligencia artificial",
        body: [
          "Para crear un itinerario enviamos a un servicio de IA el destino, las fechas y horas del viaje y tus preferencias (ritmo, intereses, transporte). No enviamos tu nombre ni tu email. Usamos Google Gemini y, si no está disponible, Anthropic Claude. Después comprobamos los lugares con OpenStreetMap (Photon) y Wikipedia.",
        ],
      },
      {
        title: "Servicios que usamos",
        body: [
          [
            "Vercel: aloja la web y la API.",
            "Supabase: base de datos e inicio de sesión. Los datos de tu cuenta se guardan en Frankfurt (Unión Europea).",
            "Google: inicio de sesión con Google (si lo eliges) e itinerarios con Gemini.",
            "Anthropic: itinerarios con Claude cuando Gemini no está disponible.",
            "Open-Meteo: busca las ciudades que escribes al planear un viaje.",
            "Ryanair y Wizz Air: consultamos sus precios desde nuestro servidor. Al pulsar «Reservar» vas a su web, donde se aplica su propia política de privacidad.",
            "OpenStreetMap, Wikipedia, Wikimedia Commons y ExchangeRate-API: mapas, descripciones, fotos y tipos de cambio. Las consultas salen de nuestro servidor, sin datos tuyos.",
          ],
        ],
      },
      {
        title: "Cookies",
        body: [
          "Solo usamos las cookies necesarias para mantener tu sesión cuando entras en tu cuenta. No usamos cookies de publicidad ni de analítica.",
        ],
      },
      {
        title: "Cuánto tiempo los guardamos",
        body: [
          "Los datos de tu cuenta se guardan mientras la tengas. Un viaje que borras se borra también de tu cuenta. Tu dirección IP solo se usa un momento para limitar el número de itinerarios por hora y aparece en los registros técnicos de nuestro proveedor de alojamiento, que se borran de forma periódica.",
        ],
      },
      {
        title: "Tus derechos",
        body: [
          "Puedes pedirnos una copia de tus datos, corregirlos, borrarlos (incluida tu cuenta) u oponerte a su uso. Escríbenos y te respondemos en un plazo máximo de un mes. Si crees que no hemos tratado bien tus datos, puedes reclamar ante la autoridad de protección de datos de tu país.",
        ],
      },
      {
        title: "Menores",
        body: ["Lowfly no está dirigida a menores de 16 años."],
      },
      {
        title: "Cambios y contacto",
        body: ["Si cambiamos esta política, actualizaremos la fecha de arriba. Para cualquier pregunta sobre tus datos, escríbenos a:"],
      },
    ],
  },
  en: {
    title: "Privacy policy",
    intro:
      "Lowfly helps you find cheap flights and plan your trip. This page explains which of your data we use, what for and who we share it with. In one sentence: we keep the minimum for the app to work and we never sell your data.",
    updated: (date) => `Last updated: ${date}`,
    sections: [
      {
        title: "Without an account",
        body: [
          "You can search flights and save trips without signing up. In that case:",
          [
            "Your trips, itineraries and preferences (departure airport, light or dark theme) are kept only in your browser (localStorage). We do not receive them.",
            "To suggest a departure airport on your first visit we use your connection's country and your browser's time zone. We do not store them.",
            "The “Use my location” button finds the nearest airport inside your browser: your position is not sent to our servers.",
          ],
        ],
      },
      {
        title: "With an account",
        body: [
          "If you sign in with Google or with a link by email, we keep:",
          [
            "Your email and, if you use Google, your name and profile picture, to identify you and show your account.",
            "Your trips: the flights you save or the trips you plan by hand, their itineraries, your preferences and the stops you mark as visited, so you have them on all your devices.",
          ],
          "When you sign in, the trips you already had in that browser are added to your account. When you sign out, they are removed from the browser and stay in your account.",
        ],
      },
      {
        title: "AI itineraries",
        body: [
          "To create an itinerary we send an AI service the destination, the trip's dates and times and your preferences (pace, interests, transport). We do not send your name or your email. We use Google Gemini and, when it is not available, Anthropic Claude. Then we check the places with OpenStreetMap (Photon) and Wikipedia.",
        ],
      },
      {
        title: "Services we use",
        body: [
          [
            "Vercel: hosts the website and the API.",
            "Supabase: database and sign-in. Your account data is stored in Frankfurt (European Union).",
            "Google: sign-in with Google (if you choose it) and itineraries with Gemini.",
            "Anthropic: itineraries with Claude when Gemini is not available.",
            "Open-Meteo: finds the towns you type when planning a trip.",
            "Ryanair and Wizz Air: we check their prices from our server. When you press “Book” you go to their website, where their own privacy policy applies.",
            "OpenStreetMap, Wikipedia, Wikimedia Commons and ExchangeRate-API: maps, descriptions, photos and exchange rates. Those requests come from our server, without any of your data.",
          ],
        ],
      },
      {
        title: "Cookies",
        body: ["We only use the cookies needed to keep you signed in to your account. We use no advertising or analytics cookies."],
      },
      {
        title: "How long we keep it",
        body: [
          "Your account data is kept while you have the account. A trip you delete is also deleted from your account. Your IP address is only used briefly to limit the number of itineraries per hour, and it appears in our hosting provider's technical logs, which are deleted periodically.",
        ],
      },
      {
        title: "Your rights",
        body: [
          "You can ask us for a copy of your data, correct it, delete it (your account included) or object to its use. Write to us and we will answer within one month. If you think we have not handled your data properly, you can complain to the data protection authority of your country.",
        ],
      },
      {
        title: "Children",
        body: ["Lowfly is not meant for children under 16."],
      },
      {
        title: "Changes and contact",
        body: ["If we change this policy, we will update the date above. For any question about your data, write to us at:"],
      },
    ],
  },
};
