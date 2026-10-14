// "Why go" for each destination (written once by scripts/destination-guides.mjs). Only read on the server,
// so the browser never downloads the whole file.
import guides from "@/data/destinationGuides.json";

// { BRI: { text, tags, source } | null } in `lang`
export function getGuides(codes, lang) {
  return Object.fromEntries(
    codes.map((code) => {
      const guide = guides[code];
      const text = guide?.[lang] ?? guide?.en;
      return [code, text ? { text: text.text, tags: text.tags, source: guide.sources.guide ?? guide.sources[lang] ?? guide.sources.en } : null];
    })
  );
}
