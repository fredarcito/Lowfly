// The kinds of search, each a page of its own for search engines and links (/es/recorridos, /en/multi-city): the
// folder that serves it (src/app/[lang]/(search)/…, named in each language in constants/sections) by its mode. The
// home (/es) searches "anywhere" too, as before.
import { folderOf } from "@/constants/sections";

export const SEARCH_PAGES = { everywhere: "anywhere", country: "destination", trip: "flexible-dates", multiCity: "multi-city" };

// The mode of a search page's path, in any language ("/es/recorridos" → "multiCity"), or null (the home, any other)
export const modeOfPath = (pathname) => {
  const folder = folderOf(pathname.split("/")[2] ?? "");
  return Object.keys(SEARCH_PAGES).find((mode) => SEARCH_PAGES[mode] === folder) ?? null;
};
