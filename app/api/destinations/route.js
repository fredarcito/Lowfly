import { handle, iata, lang } from "@/lib/api";
import { getDestinations } from "@/lib/flights";

export const GET = handle((p) => getDestinations(iata(p.get("origin")), lang(p)));
