// AI itineraries: Gemini plans the days (Claude when Gemini fails); Photon (OpenStreetMap) finds where each place really is, and
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

// Places farther than this from the destination airport are not on this trip (a wrong guess by the model)
const MAX_KM_FROM_AIRPORT = 120;
// A Wikipedia article is about the located place only if its coordinates are this close
const SAME_PLACE_KM = 2;
// Lookups at the same time against the free services (be gentle with them)
const CONCURRENCY = 4;
// The AI's coordinates are a few kilometres off at worst: a candidate farther than this from them is another place
// with the same name (a town called Modugno instead of Modugno's statue)
const NEAR_GUESS_KM = 10;
// A meal is placed only on a real place to eat, or on a neighbourhood ("lunch in Monti")
const MEAL_KINDS = /^(amenity:(restaurant|cafe|bar|pub|fast_food|ice_cream|food_court)|shop:(bakery|pastry|deli)|place:(suburb|neighbourhood|quarter))$/;

const STOP_TYPES = ["imprescindible", "recomendado", "opcional", "comida", "transporte", "logistica", "llegada"];
const SIGHT_TYPES = new Set(["imprescindible", "recomendado", "opcional"]);
const MODES = ["walking", "transit", "driving"];
const LANGUAGES = { es: "Spanish", en: "English" };

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
    days: {
      type: "array",
      items: {
        type: "object",
        properties: {
          title: { type: "string", description: "Short title for the day" },
          mode: { type: "string", enum: MODES, description: "Main way of getting around that day" },
          stops: {
            type: "array",
            items: {
              type: "object",
              properties: {
                time: { type: "string", description: "24h local time, HH:MM or HH:MM–HH:MM" },
                type: { type: "string", enum: STOP_TYPES },
                title: { type: "string" },
                note: { ...nullable("string"), description: "Practical tip: tickets, queues, how to get there" },
                why: { ...nullable("string"), description: "Sights only: 1–2 sentences on why a first-time visitor should go" },
                lookFor: { ...nullable("string"), description: "Sights only: one concrete detail to look for" },
                food: { ...nullable("string"), description: "Meals: what to eat and where" },
                cost: { ...nullable("string"), description: "Short price with currency, or free" },
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
              required: ["time", "type", "title", "note", "why", "lookFor", "food", "cost", "place"],
            },
          },
        },
        required: ["title", "mode", "stops"],
      },
    },
  },
  required: ["days"],
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

const instructionsFor = ({ lang, city, country, travel, dates, preferences }) => {
  const language = LANGUAGES[lang];
  return `You are a local travel planner. Plan a realistic day-by-day itinerary for a first-time visitor to ${city}, ${country}.
Write every text in ${language}. Return exactly ${dates.length} days, in order (${dates.join(", ")}).

Arrival and departure:
${travel.join("\n")}

Traveller preferences:
- Pace: ${PACE_RULES[preferences.pace] ?? PACE_RULES.balanced}.
- Interests: ${preferences.interests.join(", ")}.
- Getting around: ${TRANSPORT_RULES[preferences.transport] ?? TRANSPORT_RULES.transit}.
- Accommodation check-in on day 1: ${preferences.checkIn}. Add a "logistica" stop for it at that time (place null: we don't know where they stay; say "in the centre"). Plan the hours between arriving and check-in around it: if there is time before, suggest leaving the luggage in storage and light sights nearby; if it is right after arriving, go straight there. If the check-in time comes before they can arrive, check in as soon as they get there.

Rules:
- Order stops by time and group nearby places to avoid going back and forth. Day trips to nearby towns are fine when they suit the interests.
- Every full day has breakfast, lunch and dinner as "comida" stops, and "transporte" steps when moving between areas. The arrival and departure days only use the hours available.
- Meals: prefer long-established places. If you are not sure a restaurant exists, describe the area and the dish in "food" and set place to null. Never invent a restaurant.
- Types: imprescindible = must see, recomendado = recommended, opcional = optional, comida = meal, transporte = getting around, logistica = check-in, luggage, airport tasks, llegada = arrival.
- Sights (imprescindible, recomendado, opcional) need "why" and "lookFor". Other stops leave them null.
- Every place you visit (sights, restaurants, stations, airport) has a "place". Its "name" is the official name in the local language, exactly as it appears on OpenStreetMap or Google Maps (e.g. "Castello Normanno-Svevo", "Fontana di Trevi"), never a translation or a description such as "lunch near the cathedral"; the stop "title" is what gets translated. Add its coordinates (5 decimals). Pure moves (getting around) have place null.
- For sights, "wikipediaTitle" is the exact title of the article on ${lang}.wikipedia.org, or null if there is none.
- Do not write history or dates of construction: we add them from Wikipedia.
- Keep texts short: titles under 60 characters, notes and "why" under 200.`;
};

const text = (value, max = 300) => (typeof value === "string" && value.trim() ? value.trim().slice(0, max) : null);
const isCoordinate = (lat, lng) => Number.isFinite(lat) && Number.isFinite(lng) && Math.abs(lat) <= 90 && Math.abs(lng) <= 180;

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
    note: text(stop.note),
    why: sight ? text(stop.why) : null,
    lookFor: sight ? text(stop.lookFor) : null,
    food: text(stop.food),
    cost: text(stop.cost, 60),
    place,
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
const verifyStop = async (stop, { city, lang, destination, facts }) => {
  if (!stop.place) return stop;
  const { wikipediaTitle, ...guess } = stop.place;
  const plausible = (point) => point && isCoordinate(point.lat, point.lng) && km(point, guess) <= NEAR_GUESS_KM && km(point, destination) <= MAX_KM_FROM_AIRPORT;

  const found = await locate(`${guess.name}, ${city}`, guess);
  const fits = found && (stop.type === "comida" ? MEAL_KINDS.test(found.kind) : sameName(found.name, guess.name));
  const mapped = fits && plausible(found) ? found : null;

  let fact = null;
  if (SIGHT_TYPES.has(stop.type)) {
    const named = wikipediaTitle ? facts[wikipediaTitle] : null;
    const candidate = named ?? (await searchPlace(`${guess.name} ${city}`, lang));
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
    return { ...(await gemini.generateJson(request)), model: "gemini" };
  } catch (error) {
    if (!(error instanceof AppError) || !claude.hasClaude()) throw error;
    console.warn(`Gemini failed (${error.code}), trying Claude`);
    return { ...(await claude.generateJson(request)), model: "claude" };
  }
};

// Plans `dates` in one town with the AI, then checks every place: where it is (Photon) and its history
// (Wikipedia). destination: { lat, lng } of the town (only places near it are kept); label: for the logs.
const planDays = async ({ lang, city, country, destination, dates, travel, preferences, label }) => {
  const { data, usage, model } = await planWithAi({
    instructions: instructionsFor({ lang, city, country, travel, dates, preferences }),
    prompt: "Plan the itinerary now.",
    schema: SCHEMA,
  });
  console.log("AI itinerary", model, label, `${dates.length} days`, JSON.stringify(usage));

  const plannedDays = (Array.isArray(data?.days) ? data.days : []).slice(0, dates.length);
  if (!plannedDays.length) throw new AppError("aiUnavailable");
  const cleanDays = plannedDays.map((day, index) => ({
    date: dates[index],
    city,
    title: text(day.title, 120) ?? "",
    mode: MODES.includes(day.mode) ? day.mode : "walking",
    stops: (Array.isArray(day.stops) ? day.stops : []).map((stop) => cleanStop(stop, destination)),
  }));

  const titles = cleanDays.flatMap((day) => day.stops.map((stop) => stop.place?.wikipediaTitle)).filter(Boolean);
  const facts = await placeFacts(titles, lang);
  const context = { city, lang, destination, facts };
  const stops = await mapLimited(cleanDays.flatMap((day) => day.stops), CONCURRENCY, (stop) => verifyStop(stop, context));
  let taken = 0;
  return cleanDays.map((day) => ({ ...day, stops: stops.slice(taken, (taken += day.stops.length)) }));
};

// trip: { origin, code, city, country, out: { day, time, arrive }, ret?: { day, time } }
export const createItinerary = async ({ trip, lang, preferences }) => {
  const dates = daysBetween(trip.out.day, trip.ret?.day ?? trip.out.day);
  if (dates.length > MAX_TRIP_DAYS) throw new AppError("aiTooLong", { max: MAX_TRIP_DAYS }, 400);

  const { airports } = await getAirports(lang);
  const airport = airports.find((candidate) => candidate.code === trip.code);
  if (!airport || !isCoordinate(airport.lat, airport.lon)) throw new AppError("aiUnavailable");

  const days = await planDays({
    lang,
    city: trip.city,
    country: trip.country,
    destination: { lat: airport.lat, lng: airport.lon },
    dates,
    travel: flightTravel({ airport, out: trip.out, ret: trip.ret, dates }),
    preferences,
    label: trip.code,
  });
  return { source: "ai", lang, createdAt: new Date().toISOString(), preferences, days };
};

// A trip the traveller planned themselves, through one or more towns, in order:
// stops: [{ city, country, lat, lng, arrive: { day, time }, leave: { day, time } }]
// Every town is planned at the same time and the days are joined; on the day of a move the morning in one
// town and the afternoon in the next become a single day.
// Each town has its own accommodation, and the visitor does not pick a check-in time for a trip planned by
// hand: the usual one, planned around each arrival time
const STANDARD_CHECK_IN = "15:00";

export const createStopsItinerary = async ({ stops, lang, preferences }) => {
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
      });
    })
  );

  const days = [];
  for (const plan of plans) {
    for (const day of plan) {
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
  return { source: "ai", lang, createdAt: new Date().toISOString(), preferences, days };
};
