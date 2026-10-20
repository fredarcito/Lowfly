import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { APP_NAME, getDictionary } from "@/i18n";
import { asJpeg, loadDisplayFonts, OG_SIZE, OgLogo } from "@/server/openGraph";

// The picture shown when a link to Lowfly is shared (WhatsApp, Slack, X…), in the link's language:
// the landing's Positano at dusk, the logo, the headline and what the app does. As JPEG (server/openGraph).
export const size = OG_SIZE;
export const contentType = "image/jpeg";
export const alt = `${APP_NAME} · Positano`;

const OpenGraphImage = async ({ params }) => {
  const { lang } = await params;
  const { header } = getDictionary(lang);
  const photo = await readFile(join(process.cwd(), "public/hero-night-1800.jpg"));
  const photoSrc = `data:image/jpeg;base64,${photo.toString("base64")}`;
  const [firstLine, secondLine] = header.title.split("\n");
  const fonts = await loadDisplayFonts(`${header.title}${header.kicker}${header.kicker.toUpperCase()}${header.photoCreditNight}`);

  const image = new ImageResponse(
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
          <OgLogo />

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
  // The same every day: a week in the CDN
  return asJpeg(image, 7 * 86400);
};

export default OpenGraphImage;
