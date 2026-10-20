// The sections whose name in the address is in the page's language (/es/guias/…, /en/guides/…), by the folder that
// serves them (src/app/[lang]/guides): src/proxy.js shows the folder's page under each language's name and sends
// the other names there. A section not listed keeps its folder's name in every language (/es/trips). Translating
// another one is a row here (and its tests).
export const SECTIONS = {
  guides: { es: "guias", en: "guides" },
  // The kinds of search, each a page of its own (constants/searchPages)
  anywhere: { es: "a-cualquier-sitio", en: "anywhere" },
  destination: { es: "a-un-destino", en: "destination" },
  "flexible-dates": { es: "fechas-flexibles", en: "flexible-dates" },
  "multi-city": { es: "recorridos", en: "multi-city" },
};

// A section's name in `lang`: /es/{guias}
export const sectionIn = (lang, folder) => SECTIONS[folder]?.[lang] ?? folder;

// The folder a section's name stands for, in any language ("guias" → "guides"), or null when it is no translated
// section
export const folderOf = (name) => Object.keys(SECTIONS).find((folder) => folder === name || Object.values(SECTIONS[folder]).includes(name)) ?? null;
