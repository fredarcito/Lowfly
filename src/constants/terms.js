// The terms of use (/es/terms, /en/terms), in both languages. Same shape as the privacy policy
// (constants/privacy): a title, an intro and sections of paragraphs or lists (an array is a bulleted list).
// Change them whenever the service changes (and the date).
export const TERMS_UPDATED = "2026-10-15";

export const TERMS = {
  es: {
    title: "Condiciones de uso",
    intro:
      "Estas condiciones explican qué es Lowfly, qué puedes esperar de ella y qué esperamos de ti. Al usar la web, o al crear una cuenta, las aceptas.",
    updated: (date) => `Última actualización: ${date}`,
    sections: [
      {
        title: "Qué es Lowfly",
        body: [
          "Lowfly es un buscador gratuito de vuelos directos de Ryanair y Wizz Air y una herramienta para planear tus viajes, con itinerarios creados con inteligencia artificial.",
          "Lowfly no vende billetes ni cobra comisiones por ellos. Cuando pulsas «Reservar» vas a la web de la aerolínea: la compra, el precio final, el equipaje y las condiciones del billete son entre tú y la aerolínea.",
        ],
      },
      {
        title: "Precios y disponibilidad",
        body: [
          [
            "Los precios se consultan a las aerolíneas en el momento de la búsqueda y pueden cambiar o agotarse antes de que reserves. El precio que vale es el de la web de la aerolínea.",
            "Los precios son para un adulto y no incluyen equipaje facturado ni de cabina. Los precios de las maletas que mostramos son una estimación orientativa.",
            "Si una aerolínea da el precio en otra moneda, lo convertimos a euros con el tipo de cambio del día, de forma aproximada.",
          ],
        ],
      },
      {
        title: "Itinerarios con inteligencia artificial",
        body: [
          "Los itinerarios los crea una inteligencia artificial y comprobamos los lugares con mapas y Wikipedia, pero pueden contener errores: horarios, precios, lugares cerrados o que ya no existen. Compruébalos antes de ir, sobre todo los horarios de transporte, las entradas y las reservas.",
          "Para que el servicio siga siendo gratuito, el número de itinerarios por hora es limitado.",
        ],
      },
      {
        title: "Tu cuenta",
        body: [
          "Puedes usar Lowfly sin cuenta. Si creas una, eres responsable de lo que se haga con ella: no compartas el acceso a tu email ni a tu cuenta de Google. Puedes pedirnos que la borremos cuando quieras.",
        ],
      },
      {
        title: "Uso correcto",
        body: [
          "No uses Lowfly para:",
          [
            "Hacer consultas automáticas o masivas (bots, scraping) ni saltarte los límites del servicio.",
            "Intentar acceder a datos de otras personas o a partes de la web que no son públicas.",
            "Cualquier fin ilegal o que perjudique al servicio o a otras personas.",
          ],
          "Si no se respetan estas condiciones, podemos limitar o cerrar el acceso.",
        ],
      },
      {
        title: "Servicio sin garantías",
        body: [
          "Lowfly se ofrece tal cual y de forma gratuita. Depende de servicios de terceros (aerolíneas, mapas, inteligencia artificial) y puede fallar, cambiar o dejar de estar disponible. En la medida en que la ley lo permita, no somos responsables de las pérdidas que se deriven de usarlo, como un vuelo que cambia de precio o un plan que no sale como esperabas.",
        ],
      },
      {
        title: "Contenido de terceros",
        body: [
          "Las descripciones y fotos de destinos vienen de Wikipedia, Wikivoyage y Wikimedia Commons, con sus autores y licencias indicados. Los mapas son de OpenStreetMap. Las marcas de las aerolíneas pertenecen a sus dueños; Lowfly no está asociada con ellas.",
        ],
      },
      {
        title: "Cambios y contacto",
        body: [
          "Podemos cambiar estas condiciones: si lo hacemos, actualizaremos la fecha de arriba. Tus datos se tratan como explica la política de privacidad. Para cualquier pregunta, escríbenos a:",
        ],
      },
    ],
  },
  en: {
    title: "Terms of use",
    intro:
      "These terms explain what Lowfly is, what you can expect from it and what we expect from you. By using the website, or by creating an account, you accept them.",
    updated: (date) => `Last updated: ${date}`,
    sections: [
      {
        title: "What Lowfly is",
        body: [
          "Lowfly is a free search for direct Ryanair and Wizz Air flights and a tool to plan your trips, with itineraries made with artificial intelligence.",
          "Lowfly does not sell tickets or charge commissions on them. When you press “Book” you go to the airline's website: the purchase, the final price, the baggage and the ticket's conditions are between you and the airline.",
        ],
      },
      {
        title: "Prices and availability",
        body: [
          [
            "Prices are checked with the airlines when you search and may change or sell out before you book. The price that counts is the one on the airline's website.",
            "Prices are for one adult and include no checked or cabin bag. The bag prices we show are a rough estimate.",
            "If an airline quotes another currency, we convert it to euros at the day's exchange rate, approximately.",
          ],
        ],
      },
      {
        title: "AI itineraries",
        body: [
          "Itineraries are made by an artificial intelligence and we check the places with maps and Wikipedia, but they may contain mistakes: times, prices, places that are closed or no longer exist. Check them before you go, above all transport times, tickets and bookings.",
          "To keep the service free, the number of itineraries per hour is limited.",
        ],
      },
      {
        title: "Your account",
        body: [
          "You can use Lowfly without an account. If you create one, you are responsible for what is done with it: do not share access to your email or your Google account. You can ask us to delete it at any time.",
        ],
      },
      {
        title: "Fair use",
        body: [
          "Do not use Lowfly to:",
          [
            "Make automated or massive requests (bots, scraping) or get around the service's limits.",
            "Try to reach other people's data or parts of the website that are not public.",
            "Any illegal purpose, or anything that harms the service or other people.",
          ],
          "If these terms are not respected, we may limit or close access.",
        ],
      },
      {
        title: "No guarantees",
        body: [
          "Lowfly is offered as is and for free. It depends on third-party services (airlines, maps, artificial intelligence) and may fail, change or stop being available. To the extent the law allows, we are not liable for losses arising from using it, such as a flight that changes price or a plan that does not work out as expected.",
        ],
      },
      {
        title: "Third-party content",
        body: [
          "Destination descriptions and photos come from Wikipedia, Wikivoyage and Wikimedia Commons, with their authors and licences shown. Maps are from OpenStreetMap. Airline brands belong to their owners; Lowfly is not affiliated with them.",
        ],
      },
      {
        title: "Changes and contact",
        body: ["We may change these terms: if we do, we will update the date above. Your data is handled as the privacy policy explains. For any question, write to us at:"],
      },
    ],
  },
};
