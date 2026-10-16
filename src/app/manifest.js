import { APP_NAME } from "@/i18n/config";
import { THEME_COLORS } from "@/constants/theme";

// Web app manifest (/manifest.webmanifest): lets Lowfly be installed on the home screen and open full screen.
// "/" redirects to the browser's language, as in the browser.
const manifest = () => {
  return {
    name: `${APP_NAME} · Vuelos baratos e itinerarios a tu medida`,
    short_name: APP_NAME,
    description: "Los vuelos más baratos para tus fechas, directo con la aerolínea, y el itinerario de tu viaje a tu medida.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#081018",
    theme_color: THEME_COLORS.dark,
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
};

export default manifest;
