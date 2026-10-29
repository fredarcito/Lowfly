import { initBotId } from "botid/client/core";
import { SEARCH_ROUTES } from "@/constants/searchRoutes";

// Vercel's BotID: the browser proves it is one on every flight search (checked by `handleSearch`, server/handler).
// Skipped on the dev server.
initBotId({ protect: SEARCH_ROUTES.map((path) => ({ path, method: "GET" })) });
