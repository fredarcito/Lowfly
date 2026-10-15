// Shared by the preview images of shared links (app/[lang]/opengraph-image.js and the shared trips'):
// their size, the logo and the display font.
import { APP_NAME } from "@/i18n";

export const OG_SIZE = { width: 1200, height: 630 };

// The logo's plane (lucide "plane", as in the top bar)
const PLANE_PATH =
  "M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z";

// The coral square with the plane and the name, as in the top bar
export const OgLogo = () => (
  <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 64, height: 64, borderRadius: 16, background: "#ed604e" }}>
      <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: "rotate(-45deg)" }}>
        <path d={PLANE_PATH} />
      </svg>
    </div>
    <div style={{ display: "flex", fontSize: 44, fontWeight: 800, letterSpacing: -1 }}>{APP_NAME}</div>
  </div>
);

// The landing's display font, from Google Fonts, with only the letters of `text` (the default font has no
// bold). Without network the image still renders, with the default font.
const loadDisplayFont = async (weight, text) => {
  try {
    const css = await (
      await fetch(`https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@${weight}&text=${encodeURIComponent(text)}`)
    ).text();
    const fontUrl = css.match(/src: url\((.+?)\) format/)?.[1];
    return fontUrl ? await (await fetch(fontUrl)).arrayBuffer() : null;
  } catch {
    return null;
  }
};

// Regular and extra bold, ready for ImageResponse's `fonts` (none when they could not be loaded)
export const loadDisplayFonts = async (text) => {
  const letters = `${APP_NAME}${text}`;
  const [regular, bold] = await Promise.all([loadDisplayFont(400, letters), loadDisplayFont(800, letters)]);
  if (!regular || !bold) return [];
  return [
    { name: "Bricolage Grotesque", data: regular, weight: 400, style: "normal" },
    { name: "Bricolage Grotesque", data: bold, weight: 800, style: "normal" },
  ];
};
