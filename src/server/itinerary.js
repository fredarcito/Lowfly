// AI itineraries: Gemini plans the days (Claude when Gemini fails); OpenStreetMap's search (server/geocode: Photon, or
// Nominatim when it is down) finds where each place really is, and
// Wikipedia adds each sight's history and its source, only when the article is about that same spot.
// Only called from the server. The shape is described in utils/itinerary.
import { getAirports } from "@/server/airports";
import { AppError } from "@/server/errors";
import * as gemini from "@/server/gemini";
import * as claude from "@/server/claude";
import { locate } from "@/server/geocode";
import { placeFacts, searchPlace } from "@/server/wikipedia";
import { normalize } from "@/utils/format";
import { daysBetween } from "@/utils/dates";
import { km } from "@/utils/itinerary";
import { MAX_TRIP_DAYS } from "@/constants/manualTrips";

// Places farther than this from the destination airport are not on this trip (a wrong guess by the model).
// It also bounds day trips: about 2 hours away at most.
const MAX_KM_FROM_AIRPORT = 120;
// On a day trip, the stops this far from the destination are the trip's (the town visited), not the home town's
const OUT_OF_TOWN_KM = 12;
// A day trip's travel time each way, in minutes: what is believable
const EXCURSION_MINUTES = { min: 10, max: 150 };
// Towns stopped at on the way of a day trip by car, besides the one it goes to
const MAX_VIA_TOWNS = 2;
// A Wikipedia article is about the located place only if its coordinates are this close
const SAME_PLACE_KM = 2;
// Lookups at the same time against the free services (be gentle with them)
const CONCURRENCY = 4;
// The AI's coordinates are a few kilometres off at worst: a candidate farther than this from them is another place
// with the same name (a town called Modugno instead of Modugno's statue)
const NEAR_GUESS_KM = 10;
// The AI's position for the arrival airport is this close to the real one at worst (it is a big place)
const AIRPORT_KM = 5;
// A meal is placed only on a real place to eat, or on a neighbourhood ("lunch in Monti")
const MEAL_KINDS = /^(amenity:(restaurant|cafe|bar|pub|fast_food|ice_cream|food_court)|shop:(bakery|pastry|deli)|place:(suburb|neighbourhood|quarter))$/;

const STOP_TYPES = ["imprescindible", "recomendado", "opcional", "comida", "transporte", "logistica", "llegada"];
const SIGHT_TYPES = new Set(["imprescindible", "recomendado", "opcional"]);
const MODES = ["walking", "transit", "driving"];
const LANGUAGES = { es: "Spanish", en: "English" };
// The usual weather on the trip's dates, as the card shows it (components/trips/itinerary/ItineraryWeather)
const FEELS = ["cold", "cool", "mild", "warm", "hot"];
const RAIN = ["rare", "some", "often"];
// Believable typical temperatures (°C) for a place people travel to
const TEMPERATURE = { min: -40, max: 50 };

const PACE_RULES = {
  relaxed: "relaxed: 3 to 4 sights a day, long breaks",
  balanced: "balanced: 5 to 6 sights a day",
  intense: "intense: 7 or more sights a day, short breaks",
};
const TRANSPORT_RULES = {
  walking: "walking whenever possible",
  transit: "walking and public transport (metro, bus, train)",
  driving: "a rental car between towns, walking inside them",
};

const nullable = (type) => ({ type: [type, "null"] });

const SCHEMA = {
  type: "object",
  properties: {
    weather: {
      type: "object",
      description: "The weather usually expected in the town on these dates (climate averages, not a forecast)",
      properties: {
        feels: { type: "string", enum: FEELS, description: "How it usually feels outdoors during the day" },
        low: { type: "integer", description: "Typical lowest temperature at night, °C" },
        high: { type: "integer", description: "Typical highest temperature in the day, °C" },
        rain: { type: "string", enum: RAIN, description: "How often it usually rains: rare, some days, or often" },
        summary: { type: "string", description: "One short sentence on what the weather is usually like" },
        clothes: { type: "string", description: "What to wear for it, short" },
        essentials: { type: "string", description: "Other things to bring for it (umbrella, sunscreen, shoes…), short" },
      },
      required: ["feels", "low", "high", "rain", "summary", "clothes", "essentials"],
    },
    days: {
      type: "array",
      items: {
        type: "object",
        properties: {
          title: { type: "string", description: "Short title for the day" },
          mode: { type: "string", enum: MODES, description: "Main way of getting around that day" },
          excursion: {
            type: ["object", "null"],
            description: "Only for a day trip out of town: the town and the travel time each way. Otherwise null",
            properties: {
              town: { type: "string", description: "The town of the trip; on a route by car, the farthest one" },
              via: { type: "array", items: { type: "string" }, description: "By car only: the towns stopped at on the way, in order (at most 2). Otherwise empty" },
              travelMinutes: { type: "integer", description: "Travel time each way to the town, in minutes, without the stops on the way" },
            },
            required: ["town", "via", "travelMinutes"],
          },
          stops: {
            type: "array",
            items: {
              type: "object",
              properties: {
                time: { type: "string", description: "24h local time, HH:MM or HH:MM–HH:MM" },
                type: { type: "string", enum: STOP_TYPES },
                title: { type: "string" },
                town: { ...nullable("string"), description: "Day trips only: the town the stop is in, when it is not the one the traveller sleeps in. Otherwise null" },
                note: { ...nullable("string"), description: "Practical tip: tickets, queues, how to get there" },
                why: { ...nullable("string"), description: "Sights only: 1–2 sentences on why a first-time visitor should go" },
                lookFor: { ...nullable("string"), description: "Sights only: one concrete detail to look for" },
                food: { ...nullable("string"), description: "Meals: where to eat (the area or the kind of place)" },
                dishes: {
                  type: ["array", "null"],
                  description: "Meals only: typical local dishes worth ordering (2–3 at lunch and dinner, 1–2 at breakfast). Otherwise null",
                  items: {
                    type: "object",
                    properties: {
                      name: { type: "string", description: "The dish's name, as locals call it" },
                      what: { type: "string", description: "What it is, in one short sentence" },
                      why: { type: "string", description: "Why to try it here, in one short sentence" },
                    },
                    required: ["name", "what", "why"],
                  },
                },
                cost: { ...nullable("string"), description: "Sights and transport: short price with currency, or free. Meals: null" },
                tip: {
                  type: ["object", "null"],
                  description: "Meals only: where a tip is expected on top of the bill at that kind of place and not included, its usual percentage there (the United States: 15–20; Mexico: 10–15). null where it is optional or already included, and for every other stop",
                  properties: { min: { type: "integer" }, max: { type: "integer" } },
                  required: ["min", "max"],
                },
                place: {
                  type: ["object", "null"],
                  properties: {
                    name: { type: "string" },
                    lat: { type: "number" },
                    lng: { type: "number" },
                    wikipediaTitle: { ...nullable("string"), description: "Exact Wikipedia article title, sights only" },
                  },
                  required: ["name", "lat", "lng", "wikipediaTitle"],
                },
              },
              required: ["time", "type", "title", "town", "note", "why", "lookFor", "food", "dishes", "cost", "tip", "place"],
            },
          },
        },
        required: ["title", "mode", "excursion", "stops"],
      },
    },
  },
  required: ["weather", "days"],
};

// How the traveller arrives and leaves, as lines of the instructions
// By plane (a saved flight): landing at the airport, and the return flight
const flightTravel = ({ airport, out, ret, dates }) => [
  `- Day 1: the flight lands at ${airport.name} (${airport.code}) at ${out.arrive || out.time || "the morning"}. Start with the arrival and the real way into town (train, bus or taxi, with its approximate price).`,
  ret
    ? `- Day ${dates.length} (${dates.at(-1)}): the return flight leaves at ${ret.time}. Be at the airport 2 hours before and include getting there. Plan nothing after that.`
    : "- One-way trip: plan only the arrival day.",
];

// A stop of a trip the traveller planned themselves (any means of transport): they are already in town on
// arrival, and leave town at the given time, maybe for the next city of the trip
const stopTravel = ({ city, arrive, leave, from, to, dates }) => [
  `- Day 1 (${dates[0]}): the traveller arrives in ${city}${from ? ` from ${from}` : ""} at ${arrive.time || "the morning"}, already in town (no airport). Start there.`,
  leave.time
    ? `- Day ${dates.length} (${dates.at(-1)}): they leave ${city}${to ? ` for ${to}` : ""} at ${leave.time}. End with a "transporte" stop for that departure (place null) and plan nothing after it.`
    : `- Day ${dates.length} (${dates.at(-1)}): they leave ${city}${to ? ` for ${to}` : ""} in the evening: plan the whole day, ending with a "transporte" stop for the departure (place null).`,
];

// By car, a day trip can be a route stopping on the way; by bus or train, getting off halfway often means
// waiting hours for the next one, so it is one town
const dayTripRoute = (transport) =>
  transport === "driving"
    ? `- By car, a day trip can be a route: up to 2 more towns or sights on the way, each worth stopping for (something to see or a meal), listed in "via" in the order visited going there, with "town" the farthest one. Come back in one go.`
    : `- A day trip goes to one town ("via" empty): stopping halfway by bus or train often means waiting hours for the next one.`;

const instructionsFor = ({ lang, city, country, travel, dates, preferences }) => {
  const language = LANGUAGES[lang];
  return `You are a local travel planner. Plan a realistic day-by-day itinerary for a first-time visitor to ${city}, ${country}.
Write every text in ${language}. Return exactly ${dates.length} days, in order (${dates.join(", ")}).
Tone: warm and friendly, like a local friend sharing tips, but respectful. Speak to the traveller informally${lang === "es" ? ' (tú: "prueba", "acércate", "te recomendamos"; never usted: "busque", "diríjase")' : ""}, talking to them directly${lang === "es" ? ' (not impersonal: "compra la entrada online", not "se recomienda comprar" or "dejar maletas")' : ""}, and suggest rather than order ("try the ensaïmada at…", not "look for a bakery"). No slang, no jokes, no exclamation marks in a row, no emojis.

Arrival and departure:
${travel.join("\n")}

Traveller preferences:
- Pace: ${PACE_RULES[preferences.pace] ?? PACE_RULES.balanced}.
- Interests: ${preferences.interests.join(", ")}.
- Getting around: ${TRANSPORT_RULES[preferences.transport] ?? TRANSPORT_RULES.transit}.
${preferences.checkIn ? `- Accommodation check-in on day 1: ${preferences.checkIn}. Add a "logistica" stop for it at that time (place null: we don't know where they stay; say "in the centre"). Plan the hours between arriving and check-in around it: if there is time before, suggest leaving the luggage in storage and light sights nearby; if it is right after arriving, go straight there. If the check-in time comes before they can arrive, check in as soon as they get there.\n` : ""}
Rules:
- Order stops by time and group nearby places to avoid going back and forth.
- Day trips: a nearby town is fine when it suits the interests and is worth the trip, at most about 2 hours away each way (within ${MAX_KM_FROM_AIRPORT} km), only on full days (never the first or the last day) and at most one every 3 days. Worth the trip means at least 2 or 3 things to see there (or a meal it is known for) and more time there than on the road: a single sight an hour away is not worth a day. That day, set "excursion" to the town and the travel time each way in minutes, start with breakfast in town before a "transporte" stop to get there, then a "transporte" stop to come back, and after it dinner back in ${city} (the traveller sleeps there), and its "mode" is transit or driving. The day keeps the traveller's pace (its sights count, out there and back in ${city}), and coming back early, fill the hours before dinner in ${city} (a neighbourhood, a viewpoint at sunset, a market): no gap of more than about 1.5 hours. Every stop out of ${city} has "town" set to the town it is in. Every other day, "excursion" is null.
${dayTripRoute(preferences.transport)}
- Every day starts with breakfast as a "comida" stop, the departure day too: the only exception is the arrival day when the traveller gets there after 10:00. Check every day before answering: a day without breakfast is a mistake. Every full day also has lunch and dinner as "comida" stops (a day trip too: dinner back in town, after the trip back), and "transporte" steps when moving between areas. The arrival and departure days only use the hours available, with the meals that fall in them. Every day that ends with the traveller sleeping in ${city} has dinner, the arrival day too, however late they get there: a day without dinner is a mistake, like one without breakfast. Only the departure day has nothing after leaving.
- Meals: prefer long-established places. If you are not sure a restaurant exists, describe the area in "food" and set place to null. Never invent a restaurant.
- Meals are good value, where locals eat: the menú del día in Spain, street food, markets, bakeries, simple trattorias and tavernas. At most one pricier, special meal in the whole trip, and its note says so.
- Meals have no price ("cost" null): prices guessed are often off. Instead, "tip" says the usual tip where one is expected and not included.
- Every meal has "dishes": typical dishes of the place worth ordering (2–3 at lunch and dinner, 1–2 at breakfast), each with what it is and why to try it. Prefer variety across the trip, but repeating a dish is fine where the local cuisine is short. Never invent a dish or pass off a foreign one as local.
- Types: imprescindible = must see, recomendado = recommended, opcional = optional, comida = meal, transporte = getting around, logistica = check-in, luggage, airport tasks, llegada = arrival.
- Sights (imprescindible, recomendado, opcional) need "why" and "lookFor". Other stops leave them null.
- Every place you visit (sights, restaurants, stations, airport) has a "place". Its "name" is the official name in the local language, exactly as it appears on OpenStreetMap or Google Maps (e.g. "Castello Normanno-Svevo", "Fontana di Trevi"), never a translation or a description such as "lunch near the cathedral"; the stop "title" is what gets translated. Add its coordinates (5 decimals). Pure moves (getting around) have place null.
- For sights, "wikipediaTitle" is the exact title of the article on ${lang}.wikipedia.org, or null if there is none.
- Do not write history or dates of construction: we add them from Wikipedia.
- Keep texts short: titles under 60 characters, notes and "why" under 200.
- "weather": the weather usually expected in ${city} on these dates, from what you know of its climate (typical values, not a forecast): typical night low and day high in °C, how often it rains, a one-sentence summary (under 140 characters), what to wear and the other things to bring (each under 90 characters, written as a plain list such as "a light jacket and a jumper for the evening", with no label or colon). Be honest about cold, heat and rain: travellers who do not know the place rely on it. When it is usually cold, very hot or rainy, favour indoor sights at the worst hours.`;
};

const text = (value, max = 300) => (typeof value === "string" && value.trim() ? value.trim().slice(0, max) : null);
const isCoordinate = (lat, lng) => Number.isFinite(lat) && Number.isFinite(lng) && Math.abs(lat) <= 90 && Math.abs(lng) <= 180;

// A meal's dishes as the UI shows them ([{ name, what, why }], at most 3, each with its name), or null
const cleanDishes = (dishes) => {
  if (!Array.isArray(dishes)) return null;
  const clean = dishes
    .map((dish) => ({ name: text(dish?.name, 60), what: text(dish?.what, 200), why: text(dish?.why, 200) }))
    .filter((dish) => dish.name)
    .slice(0, 3);
  return clean.length ? clean : null;
};

// A believable tip percentage
const TIP_PERCENT = { min: 1, max: 30 };

// The usual tip where one is expected ({ min, max } percent), or null
const cleanTip = (tip) => {
  const { min, max } = tip ?? {};
  return Number.isInteger(min) && Number.isInteger(max) && min >= TIP_PERCENT.min && max >= min && max <= TIP_PERCENT.max ? { min, max } : null;
};

// Keeps what the UI can trust: known types and modes, trimmed texts, and only places near the destination
const cleanStop = (stop, destination) => {
  const type = STOP_TYPES.includes(stop.type) ? stop.type : "opcional";
  const sight = SIGHT_TYPES.has(type);
  const place = stop.place && isCoordinate(stop.place.lat, stop.place.lng) && km(stop.place, destination) <= MAX_KM_FROM_AIRPORT
    ? { name: text(stop.place.name, 120) ?? text(stop.title, 120), lat: stop.place.lat, lng: stop.place.lng, wikipediaTitle: sight ? text(stop.place.wikipediaTitle, 200) : null }
    : null;
  return {
    time: text(stop.time, 20),
    type,
    title: text(stop.title, 120) ?? "",
    town: text(stop.town, 80),
    note: text(stop.note),
    why: sight ? text(stop.why) : null,
    lookFor: sight ? text(stop.lookFor) : null,
    food: text(stop.food),
    dishes: type === "comida" ? cleanDishes(stop.dishes) : null,
    // A meal has no price (a guess often far off, which could put people off a good place), only its usual tip
    cost: type === "comida" ? null : text(stop.cost, 60),
    tip: type === "comida" ? cleanTip(stop.tip) : null,
    place,
  };
};

// A day trip as the UI can show it ({ town, via, travelMinutes }), or null: never on the first or last day (flights
// or the next town), and only with a believable travel time. Towns on the way (`via`) only by car
const cleanExcursion = (excursion, index, dayCount, mode) => {
  const town = text(excursion?.town, 80);
  const minutes = excursion?.travelMinutes;
  const fullDay = index > 0 && index < dayCount - 1;
  const believable = Number.isInteger(minutes) && minutes >= EXCURSION_MINUTES.min && minutes <= EXCURSION_MINUTES.max;
  if (!town || !fullDay || !believable) return null;
  const stopsOnTheWay = mode === "driving" && Array.isArray(excursion.via) ? excursion.via.map((name) => text(name, 80)) : [];
  const via = [...new Set(stopsOnTheWay.filter((name) => name && !sameName(name, town)))].slice(0, MAX_VIA_TOWNS);
  return { town, via, travelMinutes: minutes };
};

// What to wear or bring, without a label of its own in front ("Layers: a T-shirt…" → "a T-shirt…"): the card
// adds its own
const packText = (value) => text(typeof value === "string" ? value.replace(/^[^:,.]{1,20}:\s*/, "") : value, 120);

// The weather as the card can show it ({ city, feels, low, high, rain, summary, clothes, essentials }), or null when the model's
// answer is not believable
const cleanWeather = (weather, city) => {
  const { low, high } = weather ?? {};
  const believable = (value) => Number.isInteger(value) && value >= TEMPERATURE.min && value <= TEMPERATURE.max;
  if (!FEELS.includes(weather?.feels) || !RAIN.includes(weather.rain) || !believable(low) || !believable(high) || low > high) return null;
  return {
    city,
    feels: weather.feels,
    low,
    high,
    rain: weather.rain,
    summary: text(weather.summary, 160),
    clothes: packText(weather.clothes),
    essentials: packText(weather.essentials),
  };
};

// Runs `task` on every item, at most `limit` at a time, keeping the order
const mapLimited = async (items, limit, task) => {
  const results = new Array(items.length);
  let next = 0;
  const worker = async () => {
    while (next < items.length) {
      const index = next++;
      results[index] = await task(items[index], index);
    }
  };
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return results;
};

// Do the two names share a real word? ("Castello Normanno-Svevo di Bari" and "Castillo Normando-Suabo": yes)
const sameName = (first, second) => {
  const words = (name) => new Set(normalize(name ?? "").split(/[^a-z0-9]+/).filter((word) => word.length > 3));
  const firstWords = words(first);
  return [...words(second)].some((word) => [...firstWords].some((other) => other.startsWith(word.slice(0, 5)) || word.startsWith(other.slice(0, 5))));
};

// Where the stop really is, and for sights the Wikipedia history about that same spot.
// Candidates: the map search (Photon) and Wikipedia (the article the AI named, or the best search result).
// Each must be near the AI's rough position; the closest one wins. Meals must land on a place to eat or a
// neighbourhood, and the rest must share a word with the name. Nothing that cannot be checked goes on the map.
// Searches go with the town's name first; a day trip out of town (the covered bridges of Madison County from
// Des Moines) is searched again without it, near the AI's position.
const verifyStop = async (stop, { city, lang, destination, facts, airport }) => {
  if (!stop.place) return stop;
  const { wikipediaTitle, ...guess } = stop.place;
  // The airport of a trip by plane (landing, the way into town, the flight back): we know where it is, so it needs
  // no search and is on the map even when the map search is down
  if (airport && !SIGHT_TYPES.has(stop.type) && km(guess, airport) <= AIRPORT_KM) return { ...stop, place: { name: guess.name, lat: airport.lat, lng: airport.lng } };
  const plausible = (point) => point && isCoordinate(point.lat, point.lng) && km(point, guess) <= NEAR_GUESS_KM && km(point, destination) <= MAX_KM_FROM_AIRPORT;
  const fits = (found) => found && (stop.type === "comida" ? MEAL_KINDS.test(found.kind) : sameName(found.name, guess.name)) && plausible(found);

  const inTown = await locate(`${guess.name}, ${city}`, guess);
  const mapped = fits(inTown) ? inTown : await locate(guess.name, guess).then((found) => (fits(found) ? found : null));

  let fact = null;
  if (SIGHT_TYPES.has(stop.type)) {
    const named = wikipediaTitle ? facts[wikipediaTitle] : null;
    const searched = named ?? (await searchPlace(`${guess.name} ${city}`, lang));
    const candidate = plausible(searched) ? searched : named ? null : await searchPlace(guess.name, lang);
    if (candidate && plausible(candidate)) fact = candidate;
    // An article the AI named exactly but without coordinates: trust the title when the map confirmed the place
    else if (named && !isCoordinate(named.lat, named.lng) && mapped) fact = named;
  }

  // The map position unless Wikipedia's is closer to the AI's guess (Photon found a namesake)
  const factPoint = fact && isCoordinate(fact.lat, fact.lng) ? fact : null;
  const position = mapped && factPoint ? (km(mapped, guess) <= km(factPoint, guess) ? mapped : factPoint) : (mapped ?? factPoint);
  // History only when the article is about that same spot
  const sameSpot = fact && (!factPoint || !position || km(factPoint, position) <= SAME_PLACE_KM);

  const verified = { ...stop, place: position ? { name: guess.name, lat: position.lat, lng: position.lng } : null };
  return sameSpot ? { ...verified, history: fact.extract, sources: [{ title: `Wikipedia: ${fact.title}`, url: fact.url }] } : verified;
};

// Gemini plans the itinerary; when it is busy or fails, Claude does, with the same instructions and schema
const planWithAi = async (request) => {
  try {
    return { ...(await gemini.generateJson(request)), provider: "gemini" };
  } catch (error) {
    if (!(error instanceof AppError) || !claude.hasClaude()) throw error;
    console.warn(`Gemini failed (${error.code}), trying Claude`);
    return { ...(await claude.generateJson(request)), provider: "claude" };
  }
};

// Plans `dates` in one town with the AI, then checks every place: where it is (Photon) and its history
// (Wikipedia). destination: { lat, lng } of the town (only places near it are kept); label: for the logs.
// onAiCall: told of the AI call, { city, country, days, provider, model, usage, durationMs } (to keep its cost).
// airport: { name, lat, lng } of the arrival airport, on a trip by plane (its stops go there without a search; the
// landing always does).
// → { days, weather } (the town's usual weather on those dates, or null)
// A day the traveller sleeps in town always has dinner: when the AI leaves it out (it did on arrival days), a plain
// one in the evening, after the last stop, "around" the last place of the day in town
const DINNER = {
  es: { title: "Cena", food: (place) => (place ? `Por la zona de ${place}` : "En el centro") },
  en: { title: "Dinner", food: (place) => (place ? `Around ${place}` : "In the centre") },
};
const DINNER_FROM = 20 * 60;
const DINNER_MINUTES = 90;

const minutesOf = (time) => {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
};
const clockOf = (minutes) => `${String(Math.floor(minutes / 60) % 24).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;
// Where a stop starts and ends, in minutes from midnight ("13:00–14:30"; "16:00" ends when it starts), or null
const spanOf = (stop) => {
  const times = stop.time?.match(/\d{1,2}:\d{2}/g);
  return times ? { start: minutesOf(times[0]), end: minutesOf(times.at(-1)) } : null;
};

const withDinner = (day, lang) => {
  const hasDinner = day.stops.some((stop) => stop.type === "comida" && (spanOf(stop)?.start ?? 0) >= 18 * 60);
  if (hasDinner) return day;
  const lastEnd = Math.max(0, ...day.stops.map((stop) => spanOf(stop)?.end ?? 0));
  const start = Math.max(DINNER_FROM, Math.ceil(lastEnd / 15) * 15);
  const lastPlace = day.stops.filter((stop) => stop.place && !stop.town).at(-1)?.place.name;
  const texts = DINNER[lang] ?? DINNER.en;
  const dinner = {
    time: `${clockOf(start)}–${clockOf(start + DINNER_MINUTES)}`,
    type: "comida",
    title: texts.title,
    town: null,
    note: null,
    why: null,
    lookFor: null,
    food: texts.food(lastPlace),
    dishes: null,
    cost: null,
    tip: null,
    place: null,
  };
  return { ...day, stops: [...day.stops, dinner] };
};

// On a trip by plane the landing ("llegada" on day 1) is always at the airport, whatever the AI said: we know where
// it is, so day 1 is never left without its map when the AI gave no place for it (or one too far to check)
const withAirportArrival = (day, airport) => {
  if (!airport) return day;
  const place = { name: airport.name, lat: airport.lat, lng: airport.lng, wikipediaTitle: null };
  return { ...day, stops: day.stops.map((stop) => (stop.type === "llegada" ? { ...stop, place } : stop)) };
};

// `staysLastNight`: the traveller sleeps in town after the last day too (a one-way flight); otherwise they leave that day
const planDays = async ({ lang, city, country, destination, dates, travel, preferences, label, onAiCall, airport, staysLastNight = false }) => {
  const started = Date.now();
  const { data, usage, model, provider } = await planWithAi({
    instructions: instructionsFor({ lang, city, country, travel, dates, preferences }),
    prompt: "Plan the itinerary now.",
    schema: SCHEMA,
  });
  console.log("AI itinerary", model, label, `${dates.length} days`, JSON.stringify(usage));
  onAiCall?.({ city, country, days: dates.length, provider, model, usage, durationMs: Date.now() - started });

  const plannedDays = (Array.isArray(data?.days) ? data.days : []).slice(0, dates.length);
  if (!plannedDays.length) throw new AppError("aiUnavailable");
  const cleanDays = plannedDays.map((day, index) => {
    const mode = MODES.includes(day.mode) ? day.mode : "walking";
    return {
      date: dates[index],
      city,
      title: text(day.title, 120) ?? "",
      mode,
      excursion: cleanExcursion(day.excursion, index, plannedDays.length, mode),
      stops: (Array.isArray(day.stops) ? day.stops : []).map((stop) => cleanStop(stop, destination)),
    };
  }).map((day, index, days) => (index < days.length - 1 || staysLastNight ? withDinner(day, lang) : day))
    .map((day, index) => (index === 0 ? withAirportArrival(day, airport) : day));

  const titles = cleanDays.flatMap((day) => day.stops.map((stop) => stop.place?.wikipediaTitle)).filter(Boolean);
  const facts = await placeFacts(titles, lang);
  const context = { city, lang, destination, facts, airport };
  const stops = await mapLimited(cleanDays.flatMap((day) => day.stops), CONCURRENCY, (stop) => verifyStop(stop, context));
  let taken = 0;
  const days = cleanDays.map((day) => {
    const dayStops = stops.slice(taken, (taken += day.stops.length));
    // A day trip: mark the stops out there (the place out of town, or the AI said a town other than the city: a
    // meal with no set place); each keeps its town, which on a route by car is not always the farthest one
    const outThere = (stop) => (stop.place && km(stop.place, destination) > OUT_OF_TOWN_KM) || (stop.town && !sameName(stop.town, city));
    const marked = day.excursion
      ? dayStops.map((stop) => (outThere(stop) ? { ...stop, excursion: true } : { ...stop, town: null }))
      : dayStops.map((stop) => ({ ...stop, town: null }));
    return { ...day, stops: marked };
  });
  return { days, weather: cleanWeather(data.weather, city) };
};

// trip: { origin, code, city, country, out: { day, time, arrive }, ret?: { day, time } }
export const createItinerary = async ({ trip, lang, preferences, onAiCall }) => {
  const dates = daysBetween(trip.out.day, trip.ret?.day ?? trip.out.day);
  if (dates.length > MAX_TRIP_DAYS) throw new AppError("aiTooLong", { max: MAX_TRIP_DAYS }, 400);

  const { airports } = await getAirports(lang);
  const airport = airports.find((candidate) => candidate.code === trip.code);
  if (!airport || !isCoordinate(airport.lat, airport.lon)) throw new AppError("aiUnavailable");

  const { days, weather } = await planDays({
    lang,
    city: trip.city,
    country: trip.country,
    destination: { lat: airport.lat, lng: airport.lon },
    dates,
    travel: flightTravel({ airport, out: trip.out, ret: trip.ret, dates }),
    preferences,
    label: trip.code,
    onAiCall,
    airport: { name: airport.name, lat: airport.lat, lng: airport.lon },
    staysLastNight: !trip.ret,
  });
  return { source: "ai", lang, createdAt: new Date().toISOString(), preferences, weather: weather ? [weather] : [], days };
};

// A city guide's itinerary (/es/guias/roma-3-dias), the same for every visitor: `dayCount` full days in town, with
// no dates, no arrival, no departure and no check-in, at a balanced pace for the usual interests. Made once by
// scripts/city-guides.mjs and kept in src/data/cityGuides.json. Its days are "day-1", "day-2"… instead of dates.
// city: { city, country, lat, lng } (the centre: only places near it are kept)
export const GUIDE_PREFERENCES = { pace: "balanced", interests: ["culture", "food"], transport: "transit", checkIn: null };

export const createGuideItinerary = async ({ city, country, lat, lng, dayCount, lang, onAiCall }) => {
  const dates = Array.from({ length: dayCount }, (_, index) => `day-${index + 1}`);
  const travel = [
    `- This is a public guide for any first-time visitor, with no dates: every day is a full day in ${city}, from breakfast to dinner. The traveller is already in town and sleeps in the centre. No arrival, no departure, no airport, no check-in, no luggage.`,
    `- No day trips: every day stays in ${city}, and "excursion" is always null. Each day covers one or two areas, so the whole guide shows the essential ${city} once, without repeating a sight.`,
  ];
  const { days } = await planDays({
    lang,
    city,
    country,
    destination: { lat, lng },
    dates,
    travel,
    preferences: GUIDE_PREFERENCES,
    label: `guide ${city}`,
    onAiCall,
    staysLastNight: true,
  });
  return { source: "guide", lang, createdAt: new Date().toISOString(), preferences: GUIDE_PREFERENCES, days };
};

const GUIDE_INTRO_SCHEMA = {
  type: "object",
  properties: {
    summary: { type: "string", description: "One sentence for search results: what the guide covers, under 150 characters" },
    about: { type: "string", description: "2–3 sentences on the city for a first-time visitor: what it is like and why go" },
    stay: { type: "string", description: "1–2 sentences on the best area to stay for this itinerary, and why" },
    gettingAround: { type: "string", description: "1–2 sentences on getting around: on foot, metro, bus, tickets" },
    bestTime: { type: "string", description: "1–2 sentences on the best time of year to go, and what to expect in the others" },
  },
  required: ["summary", "about", "stay", "gettingAround", "bestTime"],
};

// A city guide's introduction (the page's text above the days), in `lang`: { summary, about, stay, gettingAround,
// bestTime }. Made with the guide (createGuideItinerary).
export const writeGuideIntro = async ({ city, country, dayCount, lang, onAiCall }) => {
  const started = Date.now();
  const { data, usage, model, provider } = await planWithAi({
    instructions: `You write the introduction of a public travel guide: "${city} in ${dayCount} days", for a first-time visitor to ${city}, ${country}.
Write in ${LANGUAGES[lang]}, warm and practical, like a local friend${lang === "es" ? ' (tú, never usted)' : ""}. Only facts you are sure of: no prices, no opening hours, no dates of construction. No emojis, no exclamation marks.`,
    prompt: "Write the introduction now.",
    schema: GUIDE_INTRO_SCHEMA,
  });
  onAiCall?.({ city, country, days: dayCount, provider, model, usage, durationMs: Date.now() - started });
  const intro = Object.fromEntries(Object.keys(GUIDE_INTRO_SCHEMA.properties).map((key) => [key, text(data?.[key], 500)]));
  if (Object.values(intro).some((value) => !value)) throw new AppError("aiUnavailable");
  return intro;
};

// What a guide's translation changes: every text a reader sees, nothing else (places, times and order stay)
const STOP_TEXTS = ["title", "note", "why", "lookFor", "food"];
const DISH_TEXTS = ["name", "what", "why"];
const translatable = { ...nullable("string") };
const GUIDE_TRANSLATION_SCHEMA = {
  type: "object",
  properties: {
    intro: {
      type: "object",
      properties: Object.fromEntries(Object.keys(GUIDE_INTRO_SCHEMA.properties).map((key) => [key, { type: "string" }])),
      required: Object.keys(GUIDE_INTRO_SCHEMA.properties),
    },
    days: {
      type: "array",
      items: {
        type: "object",
        properties: {
          title: { type: "string" },
          stops: {
            type: "array",
            items: {
              type: "object",
              properties: {
                ...Object.fromEntries(STOP_TEXTS.map((key) => [key, translatable])),
                dishes: {
                  type: ["array", "null"],
                  items: { type: "object", properties: Object.fromEntries(DISH_TEXTS.map((key) => [key, { type: "string" }])), required: DISH_TEXTS },
                },
              },
              required: [...STOP_TEXTS, "dishes"],
            },
          },
        },
        required: ["title", "stops"],
      },
    },
  },
  required: ["intro", "days"],
};

// The texts of a guide, without what does not change
const textsOf = (intro, itinerary) => ({
  intro,
  days: itinerary.days.map((day) => ({
    title: day.title,
    stops: day.stops.map((stop) => ({
      ...Object.fromEntries(STOP_TEXTS.map((key) => [key, stop[key] ?? null])),
      dishes: stop.dishes?.map((dish) => Object.fromEntries(DISH_TEXTS.map((key) => [key, dish[key]]))) ?? null,
    })),
  })),
});

// A city guide in another language: the same itinerary (its places, times and order) with its texts translated,
// so a reader switching languages finds the same guide. The places keep their local names (as on the map); the
// history from Wikipedia, in the first language, is left out. → { intro, itinerary }
export const translateGuide = async ({ intro, itinerary, to, city, onAiCall }) => {
  const started = Date.now();
  const { data, usage, model, provider } = await planWithAi({
    instructions: `Translate this travel guide of ${city} into ${LANGUAGES[to]}. Keep every item, in the same order and the same number of days, stops and dishes: only the words change. Keep the same warm, friendly tone, speaking to the traveller directly. Keep proper names as they are (places, streets, dishes as locals call them); translate only what describes them. null stays null.`,
    prompt: JSON.stringify(textsOf(intro, itinerary)),
    schema: GUIDE_TRANSLATION_SCHEMA,
  });
  onAiCall?.({ city, days: itinerary.days.length, provider, model, usage, durationMs: Date.now() - started });
  const translated = data?.days;
  const sameShape =
    Array.isArray(translated) &&
    translated.length === itinerary.days.length &&
    translated.every((day, index) => day.stops?.length === itinerary.days[index].stops.length);
  if (!sameShape || !data.intro) throw new AppError("aiUnavailable");
  const days = itinerary.days.map((day, dayIndex) => ({
    ...day,
    title: text(translated[dayIndex].title, 120) ?? day.title,
    stops: day.stops.map((stop, stopIndex) => {
      const words = translated[dayIndex].stops[stopIndex];
      const { history, sources, ...kept } = stop;
      return {
        ...kept,
        ...Object.fromEntries(STOP_TEXTS.map((key) => [key, stop[key] == null ? null : text(words[key], 300) ?? stop[key]])),
        dishes: stop.dishes?.map((dish, dishIndex) => ({ ...dish, ...(words.dishes?.[dishIndex] ?? {}) })) ?? null,
      };
    }),
  }));
  return {
    intro: Object.fromEntries(Object.keys(intro).map((key) => [key, text(data.intro[key], 500) ?? intro[key]])),
    itinerary: { ...itinerary, lang: to, createdAt: new Date().toISOString(), days },
  };
};

// A trip the traveller planned themselves, through one or more towns, in order:
// stops: [{ city, country, lat, lng, arrive: { day, time }, leave: { day, time } }]
// Every town is planned at the same time and the days are joined; on the day of a move the morning in one
// town and the afternoon in the next become a single day.
// Each town has its own accommodation, and the visitor does not pick a check-in time for a trip planned by
// hand: the usual one, planned around each arrival time
const STANDARD_CHECK_IN = "15:00";

export const createStopsItinerary = async ({ stops, lang, preferences, onAiCall }) => {
  const datesOf = (stop) => daysBetween(stop.arrive.day, stop.leave.day);
  const allDates = new Set(stops.flatMap(datesOf));
  if (allDates.size > MAX_TRIP_DAYS) throw new AppError("aiTooLong", { max: MAX_TRIP_DAYS }, 400);

  const plans = await Promise.all(
    stops.map((stop, index) => {
      const dates = datesOf(stop);
      return planDays({
        lang,
        city: stop.city,
        country: stop.country,
        destination: { lat: stop.lat, lng: stop.lng },
        dates,
        travel: stopTravel({ ...stop, from: stops[index - 1]?.city, to: stops[index + 1]?.city, dates }),
        preferences: { ...preferences, checkIn: STANDARD_CHECK_IN },
        label: stop.city,
        onAiCall,
      });
    })
  );

  const days = [];
  for (const plan of plans) {
    for (const day of plan.days) {
      const previous = days.at(-1);
      if (previous?.date === day.date) {
        days[days.length - 1] = {
          ...day,
          city: `${previous.city} → ${day.city}`,
          title: `${previous.city} → ${day.city}`,
          // Two towns in one day: no walking estimates between them
          mode: "transit",
          stops: [...previous.stops, ...day.stops],
        };
      } else days.push(day);
    }
  }
  // Each town's usual weather, in the route's order
  const weather = plans.map((plan) => plan.weather).filter(Boolean);
  return { source: "ai", lang, createdAt: new Date().toISOString(), preferences, weather, days };
};
