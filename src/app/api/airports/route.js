import { handle, lang } from "@/server/handler";
import { getAirports } from "@/server/airports";

export const GET = handle((p) => getAirports(lang(p)));
