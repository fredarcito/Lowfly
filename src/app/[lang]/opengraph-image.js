import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { APP_NAME, getDictionary } from "@/i18n";

// The picture shown when a link to Lowfly is shared (WhatsApp, Slack, X…), in the link's language:
// the landing's Positano at dusk, the logo, the headline and what the app does. Made once per language at build.
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = `${APP_NAME} · Positano`;

// The logo's plane (lucide "plane", as in the top bar)
const PLANE_PATH =
  "M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z";

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

const OpenGraphImage = async ({ params }) => {
  const { lang } = await params;
  const { header } = getDictionary(lang);
  const photo = await readFile(join(process.cwd(), "public/hero-night-1800.jpg"));
  const photoSrc = `data:image/jpeg;base64,${photo.toString("base64")}`;
  const [firstLine, secondLine] = header.title.split("\n");
  const text = `${APP_NAME}${header.title}${header.kicker}${header.kicker.toUpperCase()}${header.photoCreditNight}`;
  const [regular, bold] = await Promise.all([loadDisplayFont(400, text), loadDisplayFont(800, text)]);
  const fonts =
    regular && bold
      ? [
          { name: "Bricolage Grotesque", data: regular, weight: 400, style: "normal" },
          { name: "Bricolage Grotesque", data: bold, weight: 800, style: "normal" },
        ]
      : [];

  return new ImageResponse(
    (
      <div style={{ position: "relative", display: "flex", width: "100%", height: "100%", background: "#0b1016", color: "white" }}>
        <img src={photoSrc} alt="" width={1200} height={800} style={{ position: "absolute", left: 120, top: -120, width: 1200, height: 800, objectFit: "cover" }} />
        {/* Dark from the left, so the text reads over the photo */}
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: 1200,
            height: 630,
            display: "flex",
            background: "linear-gradient(90deg, rgba(11,16,22,0.97) 0%, rgba(11,16,22,0.88) 38%, rgba(11,16,22,0.25) 75%, rgba(11,16,22,0.1) 100%)",
          }}
        />
        <div style={{ position: "relative", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "64px 72px", width: "100%" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 64, height: 64, borderRadius: 16, background: "#ed604e" }}>
              <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: "rotate(-45deg)" }}>
                <path d={PLANE_PATH} />
              </svg>
            </div>
            <div style={{ display: "flex", fontSize: 44, fontWeight: 800, letterSpacing: -1 }}>{APP_NAME}</div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
            <div style={{ display: "flex", fontSize: 24, fontWeight: 400, letterSpacing: 2, textTransform: "uppercase", color: "rgba(255,255,255,0.72)" }}>
              {header.kicker}
            </div>
            <div style={{ display: "flex", flexDirection: "column", fontSize: 76, fontWeight: 800, lineHeight: 1.02, letterSpacing: -2 }}>
              <span>{firstLine}</span>
              <span style={{ color: "#ff8a74" }}>{secondLine}</span>
            </div>
          </div>

          <div style={{ display: "flex", fontSize: 18, color: "rgba(255,255,255,0.55)" }}>{header.photoCreditNight}</div>
        </div>
      </div>
    ),
    { ...size, fonts }
  );
};

export default OpenGraphImage;
