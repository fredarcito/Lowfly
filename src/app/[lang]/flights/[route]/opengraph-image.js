import { ImageResponse } from "next/og";
import { APP_NAME, getDictionary } from "@/i18n";
import { routeTexts } from "@/components/flightRoutes/data/texts";
import { findOrigin, findRoute, routesFrom } from "@/server/flightRoutes/routes";
import { originPrices, routePrices } from "@/server/flightRoutes/prices";
import { getPhotos } from "@/server/photos";
import { asJpeg, loadDisplayFonts, OG_SIZE, OgLogo, photoForImage } from "@/server/openGraph";
import { AIRLINES, createFormat } from "@/utils/format";

// The picture shown when a route's or an airport's page is shared (WhatsApp, Telegram, X…), over the destination's
// photo: "Alicante → Bari", its airlines, flight time and "direct", and its lowest price ("Desde 37,99 €", one way).
// An airport's: "Vuelos baratos desde Malta", how many direct destinations and the lowest of them. Without a photo
// (or an address that is no page), the landing's Positano at dusk.
export const size = OG_SIZE;
export const contentType = "image/jpeg";
export const alt = APP_NAME;
// A day in the CDN, as the page: the cron writes new prices once a day
const MAX_AGE = 86400;

const photoOf = async (code) => photoForImage(code ? (await getPhotos([code]).catch(() => ({})))[code]?.src : null);

// What the picture says: { code (whose photo), kicker, title, price (written, or null) }, or null (no such page)
const contentOf = async (slug, lang) => {
  const texts = routeTexts(lang);
  const format = createFormat(lang, getDictionary(lang));
  const origin = await findOrigin(slug, lang);
  if (origin) {
    const [routes, prices] = await Promise.all([routesFrom(origin.code, lang), originPrices(origin.code, lang)]);
    const amounts = Object.values(prices);
    return {
      code: origin.code,
      kicker: texts.originPage.destinations(routes.length),
      title: texts.originPage.title(origin.city),
      price: amounts.length ? format.money(Math.min(...amounts), "EUR") : null,
    };
  }
  const route = await findRoute(slug, lang);
  if (!route) return null;
  const prices = await routePrices(route, lang);
  const airlines = (prices?.airlines ?? [...new Set(route.airports.flatMap((airport) => airport.airlines))]).map((airline) => AIRLINES[airline] ?? airline);
  return {
    code: route.airports[0].code,
    kicker: [texts.direct, airlines.join(", "), prices?.minutes && format.duration(prices.minutes)].filter(Boolean).join(" · "),
    title: `${route.origin.city} → ${route.city}`,
    price: prices ? format.money(prices.cheapest.price, "EUR") : null,
  };
};

const FlightRouteImage = async ({ params }) => {
  const { lang, route: slug } = await params;
  const texts = routeTexts(lang);
  const content = (await contentOf(slug, lang).catch(() => null)) ?? { code: null, kicker: "", title: APP_NAME, price: null };
  const { kicker, title, price } = content;
  const [photoSrc, fonts] = await Promise.all([photoOf(content.code), loadDisplayFonts(`${kicker}${title}${texts.from}${price ?? ""}${texts.oneWay}`)]);
  // Long names (Las Palmas de Gran Canaria → Fuerteventura) get smaller
  const titleSize = title.length > 30 ? 60 : title.length > 20 ? 72 : 88;

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
            background: "linear-gradient(20deg, rgba(11,16,22,0.96) 0%, rgba(11,16,22,0.8) 42%, rgba(11,16,22,0.15) 80%, rgba(11,16,22,0.05) 100%)",
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
            {kicker && (
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
            )}
            <div style={{ display: "flex", fontSize: titleSize, fontWeight: 800, lineHeight: 1, letterSpacing: -2, maxWidth: 1050 }}>{title}</div>
            {price && (
              <div style={{ display: "flex", alignItems: "baseline", gap: 16 }}>
                <div style={{ display: "flex", fontSize: 32, color: "rgba(255,255,255,0.75)" }}>{texts.from}</div>
                <div style={{ display: "flex", fontSize: 64, fontWeight: 800, letterSpacing: -1, color: "#ff8a74" }}>{price}</div>
                <div style={{ display: "flex", fontSize: 24, color: "rgba(255,255,255,0.6)" }}>{texts.oneWay}</div>
              </div>
            )}
          </div>
        </div>
      </div>
    ),
    { ...size, fonts }
  );
  return asJpeg(image, MAX_AGE);
};

export default FlightRouteImage;
