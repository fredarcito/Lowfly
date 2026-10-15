import { ImageResponse } from "next/og";
import { APP_NAME, getDictionary } from "@/i18n";
import { getPlacePhoto } from "@/server/placePhotos";
import { getPhotos } from "@/server/photos";
import { asJpeg, loadDisplayFonts, OG_SIZE, OgLogo, photoForImage } from "@/server/openGraph";
import { getSharedTrip } from "@/server/sharedTrips";
import { createFormat } from "@/utils/format";

// The picture shown when a shared trip's link is sent (WhatsApp, Telegram, X…): the destination's photo,
// who shares it, the destination and the trip in one line. Without a photo (or once the link is off), the
// landing's Positano at dusk.
export const size = OG_SIZE;
export const contentType = "image/jpeg";
// A day in the CDN: WhatsApp and the like get it at once (a trip's dates and name rarely change)
const MAX_AGE = 86400;
export const alt = APP_NAME;

// The destination's photo (a trip planned by hand: its first town's), ready for the image
const photoOf = async (trip, lang) => {
  const firstStop = trip?.manual ? trip.stops?.[0] : null;
  const code = trip?.fare.code;
  let src = null;
  try {
    if (firstStop) src = (await getPlacePhoto(firstStop, lang))?.src;
    else if (code) src = (await getPhotos([code]))[code]?.src;
  } catch {}
  return photoForImage(src);
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
  const [photoSrc, fonts] = await Promise.all([photoOf(trip, lang), loadDisplayFonts(`${kicker}${title}${line}`)]);
  // Long names (a trip through several towns) get smaller
  const titleSize = title.length > 28 ? 60 : title.length > 16 ? 76 : 96;

  const image = new ImageResponse(
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
  return asJpeg(image, MAX_AGE);
};

export default SharedTripImage;
