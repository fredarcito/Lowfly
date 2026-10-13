import { handle, lang } from "@/lib/api";
import { getAirports } from "@/lib/airports";

export const GET = handle((p) => getAirports(lang(p)));
