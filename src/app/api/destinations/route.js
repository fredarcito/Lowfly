import { handle, iata, lang } from "@/server/handler";
import { getDestinations } from "@/server/flights";

// ?stopovers=1: also the destinations reached with one stop (the destination picker)
export const GET = handle((params) =>
  getDestinations(iata(params.get("origin")), lang(params), { stopovers: params.get("stopovers") === "1" })
);
