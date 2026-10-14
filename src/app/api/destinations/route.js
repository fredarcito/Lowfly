import { handle, iata, lang } from "@/server/handler";
import { getDestinations } from "@/server/flights";

export const GET = handle((p) => getDestinations(iata(p.get("origin")), lang(p)));
