import { handle, iata, lang } from "@/server/handler";
import { getDestinations } from "@/server/flights";

export const GET = handle((params) => getDestinations(iata(params.get("origin")), lang(params)));
