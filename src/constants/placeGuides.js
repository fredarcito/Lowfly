// A short guide for each sight in the sample itineraries: why go, what to look for and a bit of history,
// in every language, with the source the history comes from. Keyed by the place name in constants/itineraries.js.
// The AI will return the same fields (why, lookFor, history, sources) for each stop.
const wikipedia = (title) => ({ title: `Wikipedia: ${title.replaceAll("_", " ")}`, url: `https://en.wikipedia.org/wiki/${title}` });

export const PLACE_GUIDES = {
  // Rome
  "Basílica Santa Maria Maggiore": {
    es: {
      why: "Una de las cuatro basílicas papales mayores de Roma y la que mejor conserva su interior antiguo.",
      lookFor: "Los mosaicos del siglo V en la nave y el arco triunfal, y el techo artesonado dorado.",
      history:
        "Se levantó en el siglo V, tras el Concilio de Éfeso, y sus mosaicos de esa época son de los más antiguos de Roma. Una leyenda cuenta que la Virgen señaló el lugar con una nevada en pleno agosto; cada 5 de agosto se recuerda dejando caer pétalos blancos desde el techo. Su campanario es el más alto de la ciudad.",
    },
    en: {
      why: "One of Rome's four major papal basilicas, and the one that best keeps its ancient interior.",
      lookFor: "The 5th-century mosaics along the nave and triumphal arch, and the gilded coffered ceiling.",
      history:
        "It was built in the 5th century, after the Council of Ephesus, and its mosaics from that time are among the oldest in Rome. Legend says the Virgin marked the spot with a snowfall in August; every 5 August white petals are dropped from the ceiling to remember it. Its bell tower is the tallest in the city.",
    },
    sources: [wikipedia("Santa_Maria_Maggiore")],
  },
  Coliseo: {
    es: {
      why: "El mayor anfiteatro jamás construido y el símbolo de Roma: aquí se celebraban luchas de gladiadores ante decenas de miles de personas.",
      lookFor: "Los tres órdenes de columnas de la fachada, uno por piso, y los agujeros en la piedra donde había grapas de hierro.",
      history:
        "Lo empezó el emperador Vespasiano hacia el año 70 y lo inauguró su hijo Tito en el 80 con cien días de juegos. Se calcula que cabían entre 50.000 y 80.000 espectadores. Bajo la arena, el hipogeo guardaba fieras y decorados que subían con montacargas. Tras siglos usado como cantera, hoy es Patrimonio de la Humanidad.",
    },
    en: {
      why: "The largest amphitheatre ever built and the symbol of Rome: gladiator fights were held here before tens of thousands.",
      lookFor: "The three orders of columns on the facade, one per storey, and the holes in the stone where iron clamps once were.",
      history:
        "Emperor Vespasian began it around AD 70 and his son Titus opened it in AD 80 with a hundred days of games. It is thought to have held 50,000 to 80,000 spectators. Under the arena, the hypogeum kept animals and scenery that were lifted up through trapdoors. After centuries used as a quarry, it is now a World Heritage Site.",
    },
    sources: [wikipedia("Colosseum")],
  },
  "Piazza Venezia": {
    es: {
      why: "El cruce central de Roma, dominado por el enorme monumento blanco a Víctor Manuel II, el primer rey de la Italia unida.",
      lookFor: "El Altar de la Patria, con la tumba del Soldado Desconocido y su guardia permanente.",
      history:
        "El Vittoriano se inauguró en 1911, a los 50 años de la unificación, y se terminó en 1935. Su mármol blanco contrasta tanto con el resto de Roma que los romanos lo apodan «la máquina de escribir» o «la tarta de boda». Desde su terraza superior hay una de las vistas más amplias de la ciudad.",
    },
    en: {
      why: "Rome's central crossroads, dominated by the huge white monument to Victor Emmanuel II, the first king of a united Italy.",
      lookFor: "The Altar of the Fatherland, with the Tomb of the Unknown Soldier and its permanent guard.",
      history:
        "The Vittoriano opened in 1911, 50 years after unification, and was finished in 1935. Its white marble stands out so much from the rest of Rome that locals call it 'the typewriter' or 'the wedding cake'. Its top terrace has one of the widest views over the city.",
    },
    sources: [wikipedia("Victor_Emmanuel_II_Monument")],
  },
  "Fontana di Trevi": {
    es: {
      why: "La fuente barroca más famosa del mundo, con agua que llega por un acueducto romano de hace más de 2.000 años.",
      lookFor: "Océano en el centro, en un carro tirado por caballos marinos: uno tranquilo y otro agitado, como el mar.",
      history:
        "La diseñó Nicola Salvi y se terminó en 1762. La alimenta el Aqua Virgo, un acueducto del año 19 a. C. La tradición dice que, si lanzas una moneda de espaldas con la mano derecha sobre el hombro izquierdo, volverás a Roma. Las monedas se recogen y se donan a Cáritas.",
    },
    en: {
      why: "The most famous Baroque fountain in the world, fed by a Roman aqueduct over 2,000 years old.",
      lookFor: "Oceanus in the middle, on a chariot pulled by sea horses: one calm and one wild, like the sea.",
      history:
        "Designed by Nicola Salvi, it was finished in 1762. It is fed by the Aqua Virgo, an aqueduct from 19 BC. Tradition says that if you throw a coin with your right hand over your left shoulder, you will come back to Rome. The coins are collected and given to the charity Caritas.",
    },
    sources: [wikipedia("Trevi_Fountain")],
  },
  Pantheon: {
    es: {
      why: "El edificio de la antigua Roma mejor conservado, con una cúpula que sigue siendo la mayor de hormigón sin armar del mundo.",
      lookFor: "La inscripción de Agripa en la fachada y, dentro, el óculo: un hueco abierto de 8 metros en lo alto de la cúpula.",
      history:
        "El templo actual lo levantó el emperador Adriano hacia el año 125, aunque conserva la inscripción del primero, de Agripa. La cúpula mide lo mismo de ancho que de alto, 43 metros. Desde el año 609 es una iglesia, y por eso se salvó. Aquí está enterrado el pintor Rafael.",
    },
    en: {
      why: "The best-preserved building of ancient Rome, with a dome that is still the largest unreinforced concrete dome in the world.",
      lookFor: "Agrippa's inscription on the front and, inside, the oculus: an 8-metre opening at the top of the dome.",
      history:
        "The present temple was built by Emperor Hadrian around AD 125, though it keeps the inscription of the first one, by Agrippa. The dome is as wide as it is high: 43 metres. It has been a church since 609, which is why it survived. The painter Raphael is buried here.",
    },
    sources: [wikipedia("Pantheon,_Rome")],
  },
  "Piazza Navona": {
    es: {
      why: "La plaza barroca por excelencia, con fuentes de Bernini, pintores y terrazas; tiene la forma de un estadio romano porque lo fue.",
      lookFor: "La Fuente de los Cuatro Ríos, con el Nilo, el Ganges, el Danubio y el Río de la Plata, uno por continente.",
      history:
        "Se construyó sobre el Estadio de Domiciano, del siglo I, y conserva su forma alargada. En el siglo XVII el papa Inocencio X la convirtió en escaparate barroco: Bernini hizo la fuente central (1651) y Borromini la iglesia de Sant'Agnese que tiene enfrente.",
    },
    en: {
      why: "The quintessential Baroque square, with Bernini's fountains, painters and terraces; it is shaped like a Roman stadium because it was one.",
      lookFor: "The Fountain of the Four Rivers, with the Nile, the Ganges, the Danube and the Río de la Plata, one for each continent.",
      history:
        "It was built over the 1st-century Stadium of Domitian and keeps its long shape. In the 17th century Pope Innocent X turned it into a Baroque showcase: Bernini made the central fountain (1651) and Borromini the church of Sant'Agnese facing it.",
    },
    sources: [wikipedia("Piazza_Navona")],
  },
  "Piazza del Popolo": {
    es: {
      why: "La gran entrada norte a Roma durante siglos, abierta y monumental, al pie del mirador del Pincio.",
      lookFor: "El obelisco egipcio del centro y, en Santa Maria del Popolo, dos cuadros de Caravaggio que se pueden ver gratis.",
      history:
        "Por la Porta del Popolo llegaban los viajeros que entraban por la Via Flaminia. El obelisco, del faraón Ramsés II, lo trajo Augusto desde Egipto y se colocó aquí en 1589. Las dos iglesias casi gemelas del lado sur enmarcan el inicio de tres calles que se abren en abanico.",
    },
    en: {
      why: "Rome's grand northern entrance for centuries, open and monumental, at the foot of the Pincio viewpoint.",
      lookFor: "The Egyptian obelisk in the middle and, in Santa Maria del Popolo, two Caravaggio paintings you can see for free.",
      history:
        "Travellers arriving on the Via Flaminia entered through the Porta del Popolo. The obelisk, from Pharaoh Ramesses II, was brought from Egypt by Augustus and placed here in 1589. The two almost-twin churches on the south side frame three streets fanning out into the city.",
    },
    sources: [wikipedia("Piazza_del_Popolo")],
  },
  "Mirador del Pincio (Villa Borghese)": {
    es: {
      why: "Uno de los mejores atardeceres de Roma, con la ciudad y la cúpula de San Pedro de frente.",
      lookFor: "La cúpula de San Pedro recortada contra el cielo y, en el parque, el curioso reloj de agua del siglo XIX.",
      history:
        "El Pincio es una de las colinas de Roma, aunque no de las siete clásicas. La terraza y los jardines los diseñó Giuseppe Valadier a principios del siglo XIX, a la vez que la Piazza del Popolo de abajo. Hoy forma parte del parque de Villa Borghese.",
    },
    en: {
      why: "One of Rome's best sunsets, with the city and the dome of St Peter's straight ahead.",
      lookFor: "St Peter's dome against the sky and, in the park, the curious 19th-century water clock.",
      history:
        "The Pincio is one of Rome's hills, though not one of the classic seven. Its terrace and gardens were designed by Giuseppe Valadier in the early 19th century, together with Piazza del Popolo below. Today it is part of the Villa Borghese park.",
    },
    sources: [wikipedia("Pincian_Hill")],
  },
  "Piazza di Spagna": {
    es: {
      why: "La escalinata más famosa de Roma, punto de encuentro desde hace siglos y especialmente bonita de noche.",
      lookFor: "La Fuente de la Barcaccia al pie, con forma de barca medio hundida, y la iglesia de Trinità dei Monti arriba.",
      history:
        "Los 135 escalones se construyeron entre 1723 y 1725 para unir la plaza con la iglesia de arriba. La plaza se llama así por la embajada de España ante la Santa Sede, que sigue aquí. El poeta John Keats murió en 1821 en la casa junto a la escalinata. Hoy está prohibido sentarse en ella.",
    },
    en: {
      why: "Rome's most famous staircase, a meeting point for centuries and especially lovely at night.",
      lookFor: "The Barcaccia fountain at the bottom, shaped like a half-sunk boat, and the church of Trinità dei Monti at the top.",
      history:
        "The 135 steps were built between 1723 and 1725 to link the square with the church above. The square is named after the Spanish embassy to the Holy See, which is still here. The poet John Keats died in 1821 in the house next to the steps. Sitting on them is now forbidden.",
    },
    sources: [wikipedia("Spanish_Steps")],
  },
  "Foro Romano": {
    es: {
      why: "El corazón de la antigua Roma: aquí estaban el Senado, los templos y los tribunales donde se decidía el imperio.",
      lookFor: "La Vía Sacra y el Arco de Tito, cuyos relieves muestran el botín traído del templo de Jerusalén.",
      history:
        "Durante siglos fue la plaza pública de Roma: mercado, centro político, religioso y judicial. Tras la caída del imperio quedó enterrado y se usó como pasto de vacas, por eso en la Edad Media lo llamaban «Campo Vaccino». Las excavaciones lo sacaron a la luz desde el siglo XVIII.",
    },
    en: {
      why: "The heart of ancient Rome: the Senate, temples and courts where the empire was run stood here.",
      lookFor: "The Via Sacra and the Arch of Titus, whose reliefs show the spoils taken from the temple in Jerusalem.",
      history:
        "For centuries it was Rome's public square: market and political, religious and legal centre. After the fall of the empire it was buried and used to graze cattle, which is why in the Middle Ages it was called 'Campo Vaccino'. Excavations uncovered it from the 18th century on.",
    },
    sources: [wikipedia("Roman_Forum")],
  },
  "Monte Palatino": {
    es: {
      why: "La colina donde, según la leyenda, nació Roma, y donde vivieron los emperadores; con vistas al Foro y al Circo Máximo.",
      lookFor: "La vista del Circo Máximo desde el borde sur, donde se celebraban las carreras de cuadrigas.",
      history:
        "La tradición sitúa aquí la fundación de Roma por Rómulo. Más tarde los emperadores construyeron sus residencias en la colina, y de su nombre, Palatium, viene la palabra «palacio».",
    },
    en: {
      why: "The hill where, according to legend, Rome was born and where the emperors lived; with views over the Forum and the Circus Maximus.",
      lookFor: "The view of the Circus Maximus from the south edge, where chariot races were held.",
      history:
        "Tradition places Romulus's founding of Rome here. Later the emperors built their residences on the hill, and its name, Palatium, gave us the word 'palace'.",
    },
    sources: [wikipedia("Palatine_Hill")],
  },
  Campidoglio: {
    es: {
      why: "Una plaza diseñada por Miguel Ángel en lo alto de la colina más sagrada de Roma, con la mejor vista gratis del Foro.",
      lookFor: "El dibujo en estrella del suelo y la estatua ecuestre de Marco Aurelio (la original está en los museos de al lado).",
      history:
        "En la Antigüedad aquí estaba el templo de Júpiter, el más importante de Roma. Miguel Ángel rediseñó la plaza a partir de 1536, con la gran rampa de acceso. Los Museos Capitolinos, en los palacios de la plaza, se consideran los museos públicos más antiguos del mundo (1471).",
    },
    en: {
      why: "A square designed by Michelangelo on top of Rome's most sacred hill, with the best free view of the Forum.",
      lookFor: "The star pattern of the paving and the equestrian statue of Marcus Aurelius (the original is in the museums next door).",
      history:
        "In ancient times the temple of Jupiter, Rome's most important, stood here. Michelangelo redesigned the square from 1536, including the great ramp up to it. The Capitoline Museums, in the square's palaces, are considered the oldest public museums in the world (1471).",
    },
    sources: [wikipedia("Piazza_del_Campidoglio")],
  },
  Trastevere: {
    es: {
      why: "El barrio con más encanto de Roma: calles empedradas, hiedra en las fachadas y trattorias de toda la vida.",
      lookFor: "Los mosaicos dorados de Santa Maria in Trastevere, que de noche se ven iluminados desde la plaza.",
      history:
        "Su nombre significa «al otro lado del Tíber». Fue un barrio popular de artesanos y marineros, con fama de tener su propio carácter. Santa Maria in Trastevere es una de las iglesias más antiguas de Roma, y sus mosaicos son de los siglos XII y XIII.",
    },
    en: {
      why: "Rome's most charming neighbourhood: cobbled streets, ivy on the walls and old-school trattorias.",
      lookFor: "The golden mosaics of Santa Maria in Trastevere, lit up at night and visible from the square.",
      history:
        "Its name means 'across the Tiber'. It was a working-class district of craftsmen and sailors, famous for its own character. Santa Maria in Trastevere is one of Rome's oldest churches, and its mosaics date from the 12th and 13th centuries.",
    },
    sources: [wikipedia("Trastevere")],
  },
  "Basílica de San Pedro": {
    es: {
      why: "La iglesia más grande del mundo y una obra maestra del Renacimiento, con la Piedad de Miguel Ángel. La entrada es gratis.",
      lookFor: "La Piedad, a la derecha nada más entrar: es la única obra que Miguel Ángel firmó.",
      history:
        "La basílica actual se construyó entre 1506 y 1626 sobre la que mandó levantar Constantino encima de la tumba de San Pedro. En ella trabajaron Bramante, Miguel Ángel, que diseñó la cúpula, y Bernini, autor del gran baldaquino de bronce sobre el altar.",
    },
    en: {
      why: "The largest church in the world and a Renaissance masterpiece, with Michelangelo's Pietà. Entry is free.",
      lookFor: "The Pietà, on the right as you walk in: it is the only work Michelangelo ever signed.",
      history:
        "The present basilica was built between 1506 and 1626 over the one Constantine raised above St Peter's tomb. Bramante, Michelangelo (who designed the dome) and Bernini (who made the great bronze canopy over the altar) all worked on it.",
    },
    sources: [wikipedia("St._Peter's_Basilica")],
  },
  "Plaza de San Pedro": {
    es: {
      why: "Una plaza pensada como unos brazos que acogen a los peregrinos, obra de Bernini.",
      lookFor: "Los discos del suelo entre el obelisco y las fuentes: desde ahí, las cuatro filas de columnas parecen una sola.",
      history:
        "Bernini la diseñó entre 1656 y 1667, con una columnata de 284 columnas en cuatro filas. El obelisco egipcio del centro lo trajo a Roma el emperador Calígula y se colocó aquí en 1586.",
    },
    en: {
      why: "A square designed by Bernini as a pair of arms welcoming pilgrims.",
      lookFor: "The discs in the paving between the obelisk and the fountains: from there the four rows of columns line up as one.",
      history:
        "Bernini designed it between 1656 and 1667, with a colonnade of 284 columns in four rows. The Egyptian obelisk in the middle was brought to Rome by Emperor Caligula and set up here in 1586.",
    },
    sources: [wikipedia("St._Peter's_Square")],
  },
  "Castel Sant’Angelo": {
    es: {
      why: "Un edificio que ha sido tumba de un emperador, fortaleza de los papas y cárcel; hoy, uno de los perfiles más reconocibles de Roma.",
      lookFor: "El ángel de bronce en lo más alto y el pasadizo elevado (Passetto) que lo une con el Vaticano.",
      history:
        "Se construyó como mausoleo del emperador Adriano (años 123–139). Más tarde se convirtió en fortaleza, y los papas se refugiaban en él a través del Passetto. Su nombre viene de la visión del arcángel Miguel que, según la tradición, anunció el fin de una peste en el año 590.",
    },
    en: {
      why: "A building that has been an emperor's tomb, a papal fortress and a prison; today one of Rome's best-known silhouettes.",
      lookFor: "The bronze angel on top and the raised walkway (Passetto) linking it to the Vatican.",
      history:
        "It was built as the mausoleum of Emperor Hadrian (AD 123–139). It later became a fortress, and popes fled to it along the Passetto. Its name comes from the vision of the Archangel Michael which, tradition says, announced the end of a plague in 590.",
    },
    sources: [wikipedia("Castel_Sant'Angelo")],
  },
  "Ponte Sant’Angelo": {
    es: {
      why: "El puente más bonito de Roma, flanqueado por ángeles barrocos y con el castillo de fondo.",
      lookFor: "Los diez ángeles, cada uno con un símbolo de la Pasión: la corona de espinas, los clavos, la lanza…",
      history:
        "Lo construyó el emperador Adriano en el año 134 para llegar a su mausoleo. Los ángeles se diseñaron en el taller de Bernini hacia 1669. Los dos que talló él mismo se consideraron demasiado bellos para dejarlos a la intemperie y hoy están en la iglesia de Sant'Andrea delle Fratte; en el puente hay copias.",
    },
    en: {
      why: "Rome's most beautiful bridge, lined with Baroque angels and with the castle behind it.",
      lookFor: "The ten angels, each holding a symbol of the Passion: the crown of thorns, the nails, the lance…",
      history:
        "Emperor Hadrian built it in AD 134 to reach his mausoleum. The angels were designed in Bernini's workshop around 1669. The two he carved himself were thought too beautiful to leave outdoors and are now in the church of Sant'Andrea delle Fratte; the bridge has copies.",
    },
    sources: [wikipedia("Ponte_Sant'Angelo")],
  },
  "Campo de’ Fiori": {
    es: {
      why: "Una plaza con vida de barrio: mercado por la mañana y ambiente de terrazas por la noche.",
      lookFor: "La estatua oscura del centro: Giordano Bruno, mirando hacia el Vaticano.",
      history:
        "Su nombre, «campo de flores», viene de cuando era un prado en la Edad Media. Aquí se celebraban ejecuciones públicas: en 1600 la Inquisición quemó al filósofo Giordano Bruno, y en 1889 se le levantó la estatua. El mercado se celebra desde 1869.",
    },
    en: {
      why: "A square with real neighbourhood life: a market in the morning and terraces at night.",
      lookFor: "The dark statue in the middle: Giordano Bruno, facing the Vatican.",
      history:
        "Its name, 'field of flowers', comes from when it was a meadow in the Middle Ages. Public executions were held here: in 1600 the Inquisition burned the philosopher Giordano Bruno, and his statue went up in 1889. The market has been held since 1869.",
    },
    sources: [wikipedia("Campo_de'_Fiori")],
  },

  // Apulia and Matera
  "Polignano a Mare (Lama Monachile)": {
    es: {
      why: "Un pueblo blanco colgado sobre acantilados del Adriático, con una de las calas más fotografiadas de Italia.",
      lookFor: "La cala de Lama Monachile vista desde el puente, y la estatua de Domenico Modugno en el paseo.",
      history:
        "El casco antiguo se asienta sobre un acantilado de roca caliza lleno de cuevas marinas. La cala de Lama Monachile está encajada entre paredes de roca bajo un puente. Aquí nació Domenico Modugno, el autor de «Nel blu dipinto di blu» (Volare).",
    },
    en: {
      why: "A white town perched on Adriatic cliffs, with one of the most photographed coves in Italy.",
      lookFor: "Lama Monachile cove seen from the bridge, and the statue of Domenico Modugno on the promenade.",
      history:
        "The old town sits on a limestone cliff full of sea caves. Lama Monachile cove is wedged between rock walls under a bridge. Domenico Modugno, who wrote 'Nel blu dipinto di blu' (Volare), was born here.",
    },
    sources: [wikipedia("Polignano_a_Mare")],
  },
  "Monopoli (centro storico)": {
    es: {
      why: "Un casco antiguo blanco junto al mar, con un puerto de barcas de colores y mucho menos turismo que Polignano.",
      lookFor: "Las barcas azules del puerto viejo y el castillo de Carlos V asomado al mar.",
      history:
        "Fue un puerto importante del Adriático durante siglos. El castillo se reforzó en el siglo XVI bajo Carlos V para defender la costa. La catedral barroca guarda un icono que, según la leyenda, llegó por mar sobre una balsa.",
    },
    en: {
      why: "A white old town by the sea, with a harbour full of colourful boats and far fewer tourists than Polignano.",
      lookFor: "The blue boats in the old harbour and Charles V's castle looking out to sea.",
      history:
        "It was an important Adriatic port for centuries. The castle was strengthened in the 16th century under Charles V to defend the coast. The Baroque cathedral keeps an icon that, legend says, arrived by sea on a raft.",
    },
    sources: [wikipedia("Monopoli")],
  },
  "Alberobello (Rione Monti)": {
    es: {
      why: "Un pueblo de casas de cuento: los trulli, de piedra y techo cónico, únicos en el mundo y Patrimonio de la Humanidad.",
      lookFor: "Los símbolos pintados con cal en los techos de los trulli.",
      history:
        "Los trulli se construyen en seco, sin mortero, con piedra caliza de la zona. Se dice que se hacían así para poder desmontarlos rápido y evitar impuestos sobre las nuevas viviendas. Los de Alberobello son Patrimonio de la Humanidad desde 1996; en el barrio de Monti hay cerca de mil.",
    },
    en: {
      why: "A fairy-tale town: the trulli, stone houses with conical roofs, unique in the world and a World Heritage Site.",
      lookFor: "The symbols painted in lime on the trulli roofs.",
      history:
        "Trulli are built dry, without mortar, from local limestone. It is said they were made this way so they could be taken down quickly to dodge taxes on new houses. Alberobello's have been a World Heritage Site since 1996; the Monti district has about a thousand.",
    },
    sources: [wikipedia("Alberobello")],
  },
  "Matera (Sasso Caveoso)": {
    es: {
      why: "Una de las ciudades habitadas más antiguas del mundo, con casas e iglesias excavadas en la roca.",
      lookFor: "Las iglesias rupestres excavadas en la roca y la vista del barranco de la Gravina desde los miradores.",
      history:
        "Los Sassi están habitados desde la prehistoria. A mediados del siglo XX la pobreza en las cuevas era tal que el Estado trasladó a sus habitantes a barrios nuevos. Rehabilitados después, son Patrimonio de la Humanidad desde 1993 y Matera fue Capital Europea de la Cultura en 2019.",
    },
    en: {
      why: "One of the oldest continuously inhabited cities in the world, with homes and churches carved into the rock.",
      lookFor: "The rock-cut churches and the view of the Gravina ravine from the viewpoints.",
      history:
        "The Sassi have been lived in since prehistory. By the mid-20th century poverty in the caves was so severe that the state moved their residents to new districts. Restored since, they have been a World Heritage Site since 1993, and Matera was European Capital of Culture in 2019.",
    },
    sources: [wikipedia("Sassi_di_Matera")],
  },
  "Bari Vecchia (Basílica San Nicolás)": {
    es: {
      why: "El casco antiguo de Bari, laberíntico y auténtico, con la basílica que guarda las reliquias de San Nicolás.",
      lookFor: "Las mujeres haciendo orecchiette a mano en la puerta de casa, en la calle del Arco Basso.",
      history:
        "En 1087 unos marineros de Bari trajeron las reliquias de San Nicolás desde Mira, en la actual Turquía, y se construyó la basílica para guardarlas. Es un lugar de peregrinación tanto para católicos como para ortodoxos. San Nicolás es el origen de la figura de Papá Noel.",
    },
    en: {
      why: "Bari's old town, a maze-like and authentic quarter, with the basilica that holds the relics of St Nicholas.",
      lookFor: "Women making orecchiette by hand at their front doors, on the Arco Basso street.",
      history:
        "In 1087 sailors from Bari brought the relics of St Nicholas from Myra, in today's Turkey, and the basilica was built to hold them. It is a place of pilgrimage for both Catholics and Orthodox Christians. St Nicholas is the origin of the figure of Santa Claus.",
    },
    sources: [wikipedia("Basilica_of_Saint_Nicholas,_Bari")],
  },
};
