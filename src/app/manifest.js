import { APP_NAME } from "@/i18n/config";
import { THEME_COLORS } from "@/constants/theme";

// Web app manifest (/manifest.webmanifest): lets Lowfly be installed on the home screen and open full screen.
// "/" redirects to the browser's language, as in the browser.
const manifest = () => {
  return {
    name: `${APP_NAME} · Vuelos baratos`,
    short_name: APP_NAME,
    description: "El vuelo más barato con Ryanair y Wizz Air, directo a la aerolínea.",
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
