// The sections whose name in the address is in the page's language (/es/guias/…, /en/guides/…), by the folder that
// serves them (src/app/[lang]/guides): src/proxy.js shows the folder's page under each language's name and sends
// the other names there. A section not listed keeps its folder's name in every language (/es/trips). Translating
// another one is a row here (and its tests).
export const SECTIONS = {
  guides: { es: "guias", en: "guides" },
};

// A section's name in `lang`: /es/{guias}
export const sectionIn = (lang, folder) => SECTIONS[folder]?.[lang] ?? folder;

// The folder a section's name stands for, in any language ("guias" → "guides"), or null when it is no translated
// section
export const folderOf = (name) => Object.keys(SECTIONS).find((folder) => folder === name || Object.values(SECTIONS[folder]).includes(name)) ?? null;
