// Sample itineraries (from the user's hand-made trips) to build and try the trip pages before AI generation exists.
// Same shape the AI will return: days → stops (time, type, title, note, food, cost, place with coordinates).
// Place IDs are real Google Maps IDs, taken from those trips.
export const SAMPLE_ITINERARIES = {
  FCO: {
    "days": [
      {
        "title": "Centro histórico y atardecer en el Pincio",
        "mode": "walking",
        "stops": [
          {
            "time": "07:00",
            "type": "llegada",
            "title": "Llegada a Roma Fiumicino (FCO)",
            "note": "Vuelo desde Malta con Ryanair.",
            "place": {
              "name": "Aeropuerto de Fiumicino (FCO)",
              "lat": 41.8034632,
              "lng": 12.2519211,
              "placeId": "ChIJHxSYOHnwJRMRbzFY47QT5a8"
            }
          },
          {
            "time": "07:30",
            "type": "transporte",
            "title": "Ir a la estación de tren del aeropuerto",
            "note": "Seguir señales \"Train / Treni\"."
          },
          {
            "time": "07:45–08:17",
            "type": "transporte",
            "title": "Leonardo Express a Roma Termini",
            "note": "Tren directo. Billete en las máquinas del aeropuerto o por Trenitalia.",
            "cost": "14€"
          },
          {
            "time": "08:17",
            "type": "logistica",
            "title": "Llegada a Roma Termini",
            "note": "Inicio del viaje en Roma.",
            "place": {
              "name": "Roma Termini",
              "lat": 41.9012873,
              "lng": 12.5015756,
              "placeId": "ChIJ7__AOaRhLxMRlKlh8r59MKQ"
            }
          },
          {
            "time": "08:30",
            "type": "comida",
            "title": "Desayuno",
            "note": "Bar local cerca de Termini; desayuno rápido antes de empezar.",
            "food": "Café + cornetto (2–4€)",
            "cost": "4–8€"
          },
          {
            "time": "09:15",
            "type": "imprescindible",
            "title": "Basílica Santa Maria Maggiore",
            "note": "Primera visita del viaje, a 5 min de Termini.",
            "cost": "gratis",
            "place": {
              "name": "Basílica Santa Maria Maggiore",
              "lat": 41.8975986,
              "lng": 12.4984084,
              "placeId": "ChIJ1zB926RhLxMRejWMj_tUs_c"
            }
          },
          {
            "time": "10:00",
            "type": "opcional",
            "title": "Coliseo (solo exterior y fotos)",
            "note": "Reconocimiento para el sábado. Fotos bonitas por fuera.",
            "cost": "gratis",
            "place": {
              "name": "Coliseo",
              "lat": 41.8902102,
              "lng": 12.4922309,
              "placeId": "ChIJrRMgU7ZhLxMRxAOFkC7I8Sg"
            }
          },
          {
            "time": "10:30",
            "type": "opcional",
            "title": "Via dei Fori Imperiali",
            "note": "Paseo monumental hacia Piazza Venezia.",
            "cost": "gratis"
          },
          {
            "time": "11:00",
            "type": "opcional",
            "title": "Piazza Venezia",
            "note": "Monumento a Vittorio Emanuele II.",
            "cost": "gratis",
            "place": {
              "name": "Piazza Venezia",
              "lat": 41.8957663,
              "lng": 12.4825739,
              "placeId": "ChIJXcYD20xgLxMR457ucl3MKTE"
            }
          },
          {
            "time": "11:30",
            "type": "imprescindible",
            "title": "Fontana di Trevi",
            "note": "Tirar la moneda. Mejor a esta hora que por la tarde.",
            "cost": "gratis",
            "place": {
              "name": "Fontana di Trevi",
              "lat": 41.9009325,
              "lng": 12.483313,
              "placeId": "ChIJ1UCDJ1NgLxMRtrsCzOHxdvY"
            }
          },
          {
            "time": "12:15",
            "type": "imprescindible",
            "title": "Pantheon (exterior)",
            "note": "Entrada opcional 5€ si quieren entrar.",
            "cost": "gratis",
            "place": {
              "name": "Pantheon",
              "lat": 41.8986108,
              "lng": 12.4768729,
              "placeId": "ChIJqUCGZ09gLxMRLM42IPpl0co"
            }
          },
          {
            "time": "12:45",
            "type": "imprescindible",
            "title": "Piazza Navona",
            "note": "Una de las plazas más bonitas de Roma.",
            "cost": "gratis",
            "place": {
              "name": "Piazza Navona",
              "lat": 41.8991633,
              "lng": 12.4730742,
              "placeId": "ChIJPRydwYNgLxMRSjOCLlYkV6M"
            }
          },
          {
            "time": "13:30",
            "type": "comida",
            "title": "Almuerzo",
            "note": "Muy buena relación calidad-precio, muy cerca de Navona.",
            "food": "Pinsere (Via del Governo Vecchio 29) — pinsa romana / pizza al taglio (8–12€)",
            "cost": "10–15€"
          },
          {
            "time": "14:30",
            "type": "transporte",
            "title": "Metro al apartamento",
            "note": "Barberini → Subaugusta, Línea A. Tap & Go con tarjeta bancaria en el torno.",
            "cost": "1,50€"
          },
          {
            "time": "15:00",
            "type": "logistica",
            "title": "Check-in y descanso",
            "note": "Ducharse y descansar del madrugón.",
            "place": {
              "name": "Subaugusta (zona del alojamiento)",
              "lat": 41.8538617,
              "lng": 12.5677151,
              "placeId": "ChIJucSEatGJJRMR0_VyGm4hIKA"
            }
          },
          {
            "time": "17:30",
            "type": "transporte",
            "title": "Metro al centro",
            "note": "Subaugusta → Flaminio, dirección Battistini.",
            "cost": "1,50€"
          },
          {
            "time": "18:00",
            "type": "opcional",
            "title": "Piazza del Popolo",
            "note": "Gran plaza con dos iglesias gemelas.",
            "cost": "gratis",
            "place": {
              "name": "Piazza del Popolo",
              "lat": 41.9110163,
              "lng": 12.4762093,
              "placeId": "ChIJ0TL65fhgLxMRaipZ80mHe8g"
            }
          },
          {
            "time": "18:15",
            "type": "imprescindible",
            "title": "Mirador del Pincio",
            "note": "Mejor atardecer del viaje. Vistas de toda Roma. Subir por la rampa.",
            "cost": "gratis",
            "place": {
              "name": "Mirador del Pincio (Villa Borghese)",
              "lat": 41.9138782,
              "lng": 12.4853818,
              "placeId": "ChIJj1M8HQJhLxMRRI6D_z18Pes"
            }
          },
          {
            "time": "19:30",
            "type": "opcional",
            "title": "Piazza di Spagna",
            "note": "Escalinata famosa. Bonita de noche.",
            "cost": "gratis",
            "place": {
              "name": "Piazza di Spagna",
              "lat": 41.9056978,
              "lng": 12.482327,
              "placeId": "ChIJ4_TEG1VgLxMROFkd29jWdug"
            }
          },
          {
            "time": "20:30",
            "type": "comida",
            "title": "Cena",
            "note": "Reserva recomendable. Muy buena cocina, ambiente auténtico.",
            "food": "Trattoria Monti (Via di San Vito 13) — pasta fresca / ravioli con huevo (15–25€)",
            "cost": "15–25€"
          },
          {
            "time": "22:00",
            "type": "transporte",
            "title": "Regreso al apartamento",
            "note": "Spagna → Subaugusta, Línea A. Descansar bien para el Coliseo mañana.",
            "cost": "1,50€"
          }
        ]
      },
      {
        "title": "Coliseo, Foro Romano y Trastevere",
        "mode": "walking",
        "stops": [
          {
            "time": "08:00",
            "type": "comida",
            "title": "Desayuno",
            "note": "Bar local cerca del alojamiento. Salir con tiempo y energía.",
            "food": "Café + cornetto (2–4€)",
            "cost": "4–8€"
          },
          {
            "time": "08:20",
            "type": "transporte",
            "title": "Salida hacia el Coliseo",
            "note": "Subaugusta → Termini (cambio) → Colosseo, líneas A + B.",
            "cost": "1,50€"
          },
          {
            "time": "09:15",
            "type": "logistica",
            "title": "Llegada al Coliseo",
            "note": "Estar en la entrada 15 min antes.",
            "place": {
              "name": "Coliseo",
              "lat": 41.8902102,
              "lng": 12.4922309,
              "placeId": "ChIJrRMgU7ZhLxMRxAOFkC7I8Sg"
            }
          },
          {
            "time": "09:30",
            "type": "logistica",
            "title": "Control de acceso",
            "note": "Mostrar ticket en el móvil + DNI/pasaporte."
          },
          {
            "time": "09:45",
            "type": "imprescindible",
            "title": "Entrada al Coliseo",
            "note": "Entrada ya pagada y confirmada.",
            "cost": "18€",
            "place": {
              "name": "Coliseo",
              "lat": 41.8902102,
              "lng": 12.4922309,
              "placeId": "ChIJrRMgU7ZhLxMRxAOFkC7I8Sg"
            }
          },
          {
            "time": "09:45–11:00",
            "type": "imprescindible",
            "title": "Visita al Coliseo (1er y 2do nivel)",
            "note": "Unos 75 minutos para recorrerlo.",
            "place": {
              "name": "Coliseo",
              "lat": 41.8902102,
              "lng": 12.4922309,
              "placeId": "ChIJrRMgU7ZhLxMRxAOFkC7I8Sg"
            }
          },
          {
            "time": "11:00–12:30",
            "type": "imprescindible",
            "title": "Foro Romano",
            "note": "Incluido en el ticket del Coliseo. Espectacular.",
            "place": {
              "name": "Foro Romano",
              "lat": 41.8920906,
              "lng": 12.4864378,
              "placeId": "ChIJ782pg7NhLxMR5n3swAdAkfo"
            }
          },
          {
            "time": "12:30–13:15",
            "type": "imprescindible",
            "title": "Monte Palatino",
            "note": "Vistas increíbles desde arriba.",
            "place": {
              "name": "Monte Palatino",
              "lat": 41.8886559,
              "lng": 12.4875481,
              "placeId": "ChIJowJff7VhLxMRLmHQKoSniFE"
            }
          },
          {
            "time": "13:30",
            "type": "comida",
            "title": "Almuerzo",
            "note": "Auténtica cocina romana, a 5 min del Foro. Alternativa más rápida y barata: Pizzeria della Madonna ai Monti (pizza al taglio, 5–10€).",
            "food": "Taverna Romana (Via della Madonna dei Monti 79) — carbonara / cacio e pepe (12–18€)",
            "cost": "15–20€"
          },
          {
            "time": "15:00",
            "type": "opcional",
            "title": "Via dei Fori Imperiali",
            "note": "Paseo con vistas a los foros.",
            "cost": "gratis"
          },
          {
            "time": "15:30",
            "type": "opcional",
            "title": "Piazza Venezia",
            "note": "Fotos del Vittoriano.",
            "cost": "gratis",
            "place": {
              "name": "Piazza Venezia",
              "lat": 41.8957663,
              "lng": 12.4825739,
              "placeId": "ChIJXcYD20xgLxMR457ucl3MKTE"
            }
          },
          {
            "time": "16:00",
            "type": "recomendado",
            "title": "Campidoglio (Capitolio)",
            "note": "Diseñado por Miguel Ángel. Mirador al Foro por detrás.",
            "cost": "gratis",
            "place": {
              "name": "Campidoglio",
              "lat": 41.8932621,
              "lng": 12.4828652,
              "placeId": "ChIJuwpUX0tgLxMRCXiwBMdFxQ8"
            }
          },
          {
            "time": "17:00",
            "type": "imprescindible",
            "title": "Mirador del Foro Romano",
            "note": "La mejor vista gratuita del Foro Romano.",
            "cost": "gratis",
            "place": {
              "name": "Campidoglio",
              "lat": 41.8932621,
              "lng": 12.4828652,
              "placeId": "ChIJuwpUX0tgLxMRCXiwBMdFxQ8"
            }
          },
          {
            "time": "17:30",
            "type": "transporte",
            "title": "Paseo hacia Trastevere",
            "note": "Cruzar el Tíber por Ponte Palatino o Isola Tiberina.",
            "cost": "gratis"
          },
          {
            "time": "18:30",
            "type": "imprescindible",
            "title": "Paseo por Trastevere",
            "note": "El barrio más bonito y auténtico de Roma.",
            "cost": "gratis",
            "place": {
              "name": "Trastevere",
              "lat": 41.8896132,
              "lng": 12.4702614,
              "placeId": "ChIJpX_kdjhgLxMRZbFsEuAsO_0"
            }
          },
          {
            "time": "20:00",
            "type": "comida",
            "title": "Cena",
            "note": "Auténtico desde 1933; reservar si se puede. Alternativa sin reserva (puede haber cola): Tonnarello, Via della Paglia 1.",
            "food": "Da Enzo al 29 (Via dei Vascellari 29) — carbonara / amatriciana / carciofi (15–25€)",
            "cost": "15–30€"
          },
          {
            "time": "22:00",
            "type": "transporte",
            "title": "Regreso al apartamento",
            "note": "Bus 8 hasta Largo Argentina + Metro A, o taxi.",
            "cost": "1,50€"
          }
        ]
      },
      {
        "title": "Vaticano y últimas plazas",
        "mode": "walking",
        "stops": [
          {
            "time": "07:30",
            "type": "transporte",
            "title": "Salida hacia el Vaticano",
            "note": "Metro A dirección Battistini; bajar en Ottaviano.",
            "cost": "1,50€"
          },
          {
            "time": "08:15",
            "type": "logistica",
            "title": "Llegada al Vaticano",
            "note": "Ir directo a la basílica."
          },
          {
            "time": "08:30–10:30",
            "type": "imprescindible",
            "title": "Basílica de San Pedro",
            "note": "Entrada gratuita; a esta hora hay poca cola. La Piedad de Miguel Ángel.",
            "cost": "gratis",
            "place": {
              "name": "Basílica de San Pedro",
              "lat": 41.9021667,
              "lng": 12.4539367,
              "placeId": "ChIJWZsUt2FgLxMRg1KHzXfwS3I"
            }
          },
          {
            "time": "10:30",
            "type": "opcional",
            "title": "Plaza de San Pedro",
            "note": "Fotos con la columnata de Bernini.",
            "cost": "gratis",
            "place": {
              "name": "Plaza de San Pedro",
              "lat": 41.9022225,
              "lng": 12.4567283,
              "placeId": "ChIJNTWtsGdgLxMRWHKtWlubvrA"
            }
          },
          {
            "time": "11:00",
            "type": "opcional",
            "title": "Castel Sant’Angelo (exterior)",
            "note": "Muy fotogénico por fuera.",
            "cost": "gratis",
            "place": {
              "name": "Castel Sant’Angelo",
              "lat": 41.9030632,
              "lng": 12.466276,
              "placeId": "ChIJ0aTnEYeKJRMRiUF95xwRbDY"
            }
          },
          {
            "time": "11:30",
            "type": "imprescindible",
            "title": "Puente Sant’Angelo",
            "note": "Ángeles de Bernini. Una de las fotos más bonitas del viaje.",
            "cost": "gratis",
            "place": {
              "name": "Ponte Sant’Angelo",
              "lat": 41.9017493,
              "lng": 12.466462,
              "placeId": "ChIJG2jInFxgLxMR0wWyy--jw7Y"
            }
          },
          {
            "time": "12:00",
            "type": "opcional",
            "title": "Piazza Navona",
            "note": "Fuente de los Cuatro Ríos de Bernini.",
            "cost": "gratis",
            "place": {
              "name": "Piazza Navona",
              "lat": 41.8991633,
              "lng": 12.4730742,
              "placeId": "ChIJPRydwYNgLxMRSjOCLlYkV6M"
            }
          },
          {
            "time": "12:30",
            "type": "opcional",
            "title": "Campo de’ Fiori",
            "note": "Mercado por la mañana; ambiente local.",
            "cost": "gratis",
            "place": {
              "name": "Campo de’ Fiori",
              "lat": 41.8956045,
              "lng": 12.4721757,
              "placeId": "ChIJfc8DqVVgLxMRxPIIp3z8CBg"
            }
          },
          {
            "time": "13:30",
            "type": "comida",
            "title": "Almuerzo final",
            "note": "Hacen la pasta delante de ti. Muy auténtico, cerca de Campo de’ Fiori.",
            "food": "Osteria da Fortunata (Via del Pellegrino 31) — pasta fresca hecha a mano / carbonara (12–18€)",
            "cost": "15–20€"
          },
          {
            "time": "15:00",
            "type": "opcional",
            "title": "Tiempo libre",
            "note": "Helado, compras, paseo. Gelateria del Teatro, cerca de Navona."
          },
          {
            "time": "16:30",
            "type": "transporte",
            "title": "Regreso al apartamento",
            "note": "Recoger el equipaje y prepararse.",
            "cost": "1,50€"
          },
          {
            "time": "17:30",
            "type": "transporte",
            "title": "Salida hacia Termini",
            "note": "Con margen para el aeropuerto.",
            "cost": "1,50€"
          },
          {
            "time": "18:20",
            "type": "transporte",
            "title": "Leonardo Express a Fiumicino",
            "note": "Directo al aeropuerto, 32 minutos.",
            "cost": "14€"
          },
          {
            "time": "18:52",
            "type": "logistica",
            "title": "Llegada a Fiumicino (FCO)",
            "note": "Tiempo suficiente para el vuelo.",
            "place": {
              "name": "Aeropuerto de Fiumicino (FCO)",
              "lat": 41.8034632,
              "lng": 12.2519211,
              "placeId": "ChIJHxSYOHnwJRMRbzFY47QT5a8"
            }
          },
          {
            "time": "21:00",
            "type": "llegada",
            "title": "Vuelo de regreso a Malta",
            "note": "Fin del viaje."
          }
        ]
      }
    ]
  },
  BRI: {
    "days": [
      {
        "title": "Bari → Polignano → Monopoli → Alberobello → Matera",
        "mode": "driving",
        "stops": [
          {
            "time": "07:00–08:30",
            "type": "logistica",
            "title": "Llegada, recoger equipaje y coche de alquiler",
            "note": "Intentar salir temprano para aprovechar el día.",
            "food": "Café rápido si apetece (capuchino/cornetto)",
            "place": {
              "name": "Aeropuerto de Bari (BRI)",
              "lat": 41.1359898,
              "lng": 16.7618185,
              "placeId": "ChIJieUjd3XvRxMRAhvw5jinutA"
            }
          },
          {
            "time": "08:30–09:30",
            "type": "transporte",
            "title": "Bari → Polignano a Mare",
            "note": "Conducción aprox. 30–40 min. Evitar ZTL en los centros históricos."
          },
          {
            "time": "09:30–13:00",
            "type": "imprescindible",
            "title": "Polignano a Mare",
            "note": "Casco antiguo, miradores, foto en Lama Monachile. Alternativa más económica: snack + helado.",
            "food": "Panino di mare (pulpo/gambas) + agua + helado (~15€/persona)",
            "place": {
              "name": "Polignano a Mare (Lama Monachile)",
              "lat": 40.9963887,
              "lng": 17.2181307,
              "placeId": "ChIJ1ZJno-zLRxMRYinbB5d7PLY"
            }
          },
          {
            "time": "13:00–13:30",
            "type": "transporte",
            "title": "Polignano → Monopoli",
            "note": "Conducción aprox. 15–20 min. El parking suele ser más fácil fuera del centro."
          },
          {
            "time": "13:30–16:30",
            "type": "opcional",
            "title": "Monopoli",
            "note": "Puerto antiguo, paseo relajado, catedral y centro. Tomarlo con calma; buen lugar para pausa.",
            "food": "Helado artesanal / café",
            "place": {
              "name": "Monopoli (centro storico)",
              "lat": 40.952487,
              "lng": 17.3050651,
              "placeId": "ChIJL_EjVAA1RhMRb1ayfpXnUCM"
            }
          },
          {
            "time": "16:30–17:30",
            "type": "transporte",
            "title": "Monopoli → Alberobello",
            "note": "Conducción aprox. 50–60 min. Llegar para el atardecer."
          },
          {
            "time": "17:30–19:30",
            "type": "imprescindible",
            "title": "Alberobello",
            "note": "Trulli al atardecer y primeras luces (Rione Monti + Aia Piccola).",
            "food": "Copa de vino Primitivo o aperitivo",
            "cost": "parking ~5€",
            "place": {
              "name": "Alberobello (Rione Monti)",
              "lat": 40.7822168,
              "lng": 17.2371954,
              "placeId": "ChIJGwx8FLmzRxMRLaUmk6HUWdg"
            }
          },
          {
            "time": "19:30–20:30",
            "type": "transporte",
            "title": "Alberobello → Matera",
            "note": "Conducción aprox. 1h05–1h15. Conducir con calma; posible niebla según la época."
          },
          {
            "time": "20:30–21:30",
            "type": "logistica",
            "title": "Matera (Sassi): check-in + primer paseo nocturno",
            "note": "Sasso Barisano / Sasso Caveoso. Matera de noche es el \"momento cumbre\" del viaje.",
            "place": {
              "name": "Matera (Sasso Caveoso)",
              "lat": 40.6634764,
              "lng": 16.6118324,
              "placeId": "ChIJo1xRWtl-RxMR_-DQME33X6E"
            }
          },
          {
            "time": "21:30–23:00",
            "type": "comida",
            "title": "Cena en restaurante en cueva",
            "food": "Peperoni cruschi, pan de Matera, pasta local",
            "cost": "~40€/persona con bebida"
          },
          {
            "time": "23:00–23:30",
            "type": "opcional",
            "title": "Paseo corto post-cena (miradores)",
            "note": "No alargar si están cansados del vuelo."
          }
        ]
      },
      {
        "title": "Matera de día y vuelta a Bari",
        "mode": "driving",
        "stops": [
          {
            "time": "09:00–10:00",
            "type": "comida",
            "title": "Desayuno con calma",
            "food": "Café + dulce local",
            "cost": "~7,5€/persona"
          },
          {
            "time": "10:00–13:00",
            "type": "imprescindible",
            "title": "Matera de día: Sasso Caveoso y miradores",
            "note": "Paseo por los callejones; mejor luz para fotos y detalles.",
            "place": {
              "name": "Matera (Sasso Caveoso)",
              "lat": 40.6634764,
              "lng": 16.6118324,
              "placeId": "ChIJo1xRWtl-RxMR_-DQME33X6E"
            }
          },
          {
            "time": "13:00–14:00",
            "type": "opcional",
            "title": "Sitio cultural opcional: Casa Grotta o iglesia rupestre",
            "note": "El precio depende del sitio elegido.",
            "cost": "~10€/persona"
          },
          {
            "time": "14:00–15:30",
            "type": "comida",
            "title": "Almuerzo",
            "food": "Ciallèdd / orecchiette / plato local",
            "cost": "~35€/persona"
          },
          {
            "time": "15:30–16:30",
            "type": "transporte",
            "title": "Matera → Bari",
            "note": "Conducción aprox. 1h. Salir con tiempo para Bari y el aeropuerto."
          },
          {
            "time": "17:00–19:30",
            "type": "imprescindible",
            "title": "Bari Vecchia",
            "note": "Basílica de San Nicolás, Via delle Orecchiette, calles del centro histórico.",
            "food": "Focaccia barese (3–4€/persona + bebida)",
            "place": {
              "name": "Bari Vecchia (Basílica San Nicolás)",
              "lat": 41.1303137,
              "lng": 16.8701375,
              "placeId": "ChIJAQV0ZWPoRxMRpltjt0sPOHs"
            }
          },
          {
            "time": "19:30–20:00",
            "type": "transporte",
            "title": "Bari → Aeropuerto (BRI)",
            "note": "Conducción 20–30 min. Devolver el coche + check-in."
          },
          {
            "time": "20:00–22:00",
            "type": "logistica",
            "title": "Aeropuerto Bari: devolución de coche, seguridad, embarque",
            "note": "Recomendable estar ~2h antes.",
            "food": "Snack si hace falta",
            "place": {
              "name": "Aeropuerto de Bari (BRI)",
              "lat": 41.1359898,
              "lng": 16.7618185,
              "placeId": "ChIJieUjd3XvRxMRAhvw5jinutA"
            }
          }
        ]
      }
    ]
  },
};
// Ciampino is Rome too
SAMPLE_ITINERARIES.CIA = SAMPLE_ITINERARIES.FCO;
