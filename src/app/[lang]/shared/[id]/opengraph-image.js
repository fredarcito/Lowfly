import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { APP_NAME, getDictionary } from "@/i18n";
import { getPhotos } from "@/server/photos";
import { loadDisplayFonts, OG_SIZE, OgLogo } from "@/server/openGraph";
import { getSharedTrip } from "@/server/sharedTrips";
import { createFormat } from "@/utils/format";

// The picture shown when a shared trip's link is sent (WhatsApp, Telegram, X…): the destination's photo,
// who shares it, the destination and the trip in one line. Without a photo (or once the link is off), the
// landing's Positano at dusk.
export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = APP_NAME;

const fallbackPhoto = async () => {
  const photo = await readFile(join(process.cwd(), "public/hero-night-1800.jpg"));
  return `data:image/jpeg;base64,${photo.toString("base64")}`;
};

const photoOf = async (code) => {
  if (!code) return fallbackPhoto();
  try {
    const photos = await getPhotos([code]);
    return photos[code]?.src ?? (await fallbackPhoto());
  } catch {
    return fallbackPhoto();
  }
};

// "23 – 27 Oct · 4 nights · 5-day itinerary"
const tripLine = (trip, texts, format) => {
  const { fare } = trip;
  const parts = [fare.ret ? format.fmtRange(fare.day, fare.ret.day) : format.fmtDay(fare.day)];
  if (fare.ret) parts.push(texts.units.nights(fare.nights));
  if (trip.itinerary?.days?.length) parts.push(texts.share.days(trip.itinerary.days.length));
  return parts.join(" · ");
};

const SharedTripImage = async ({ params }) => {
  const { lang, id } = await params;
  const texts = getDictionary(lang);
  const format = createFormat(lang, texts);
  const shared = await getSharedTrip(id).catch(() => null);
  const trip = shared?.trip;
  const kicker = shared ? texts.share.sharedBy(shared.owner.name) : texts.share.goneTitle;
  const title = trip ? trip.fare.city : APP_NAME;
  const line = trip ? tripLine(trip, texts, format) : "";
  const [photoSrc, fonts] = await Promise.all([photoOf(trip?.fare.code), loadDisplayFonts(`${kicker}${title}${line}`)]);
  // Long names (a trip through several towns) get smaller
  const titleSize = title.length > 28 ? 60 : title.length > 16 ? 76 : 96;

  return new ImageResponse(
    (
      <div style={{ position: "relative", display: "flex", width: "100%", height: "100%", background: "#0b1016", color: "white" }}>
        <img src={photoSrc} alt="" width={1200} height={630} style={{ position: "absolute", left: 0, top: 0, width: 1200, height: 630, objectFit: "cover" }} />
        {/* Dark from the bottom left, where the text sits */}
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: 1200,
            height: 630,
            display: "flex",
            background: "linear-gradient(20deg, rgba(11,16,22,0.96) 0%, rgba(11,16,22,0.8) 40%, rgba(11,16,22,0.15) 80%, rgba(11,16,22,0.05) 100%)",
          }}
        />
        {/* And a little at the top, under the logo */}
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: 1200,
            height: 220,
            display: "flex",
            background: "linear-gradient(180deg, rgba(11,16,22,0.55) 0%, rgba(11,16,22,0) 100%)",
          }}
        />
        <div style={{ position: "relative", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "60px 72px", width: "100%" }}>
          <OgLogo />

          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <div
              style={{
                display: "flex",
                alignSelf: "flex-start",
                padding: "10px 22px",
                borderRadius: 999,
                background: "rgba(255,255,255,0.14)",
                fontSize: 26,
                color: "rgba(255,255,255,0.9)",
              }}
            >
              {kicker}
            </div>
            <div style={{ display: "flex", fontSize: titleSize, fontWeight: 800, lineHeight: 1, letterSpacing: -2, maxWidth: 1000 }}>{title}</div>
            {line && <div style={{ display: "flex", fontSize: 32, color: "#ff8a74", fontWeight: 800 }}>{line}</div>}
          </div>
        </div>
      </div>
    ),
    { ...size, fonts }
  );
};

export default SharedTripImage;
