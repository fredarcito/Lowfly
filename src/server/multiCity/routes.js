// The multi-city routes (docs/multi-city.md) as written in src/data/multiCity/, one file per region, reviewed by hand
// and checked with scripts/check-multi-city.mjs. Only read on the server (~600 KB: never import it from the browser).
// A new region file is added to REGIONS.
import balkansGreece from "@/data/multiCity/balkans-greece.json";
import centralBaltic from "@/data/multiCity/central-baltic.json";
import christmas from "@/data/multiCity/christmas.json";
import east from "@/data/multiCity/east.json";
import iberiaFrance from "@/data/multiCity/iberia-france.json";
import italyMalta from "@/data/multiCity/italy-malta.json";
import moroccoTurkey from "@/data/multiCity/morocco-turkey.json";
import spainIslands from "@/data/multiCity/spain-islands.json";
import westNorth from "@/data/multiCity/west-north.json";

const REGIONS = [italyMalta, iberiaFrance, spainIslands, westNorth, centralBaltic, balkansGreece, east, moroccoTurkey, christmas];

// Every route with its id: [{ id, kind, name, summary, countries, reversible, months, versions, note?, season? }]
export const MULTI_CITY_ROUTES = REGIONS.flatMap((region) => Object.entries(region).map(([id, route]) => ({ id, ...route })));

// One route by its id, or null
export const multiCityRoute = (id) => MULTI_CITY_ROUTES.find((route) => route.id === id) ?? null;
