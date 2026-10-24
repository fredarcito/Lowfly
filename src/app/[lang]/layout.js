import { notFound } from "next/navigation";
import { Atkinson_Hyperlegible, Bricolage_Grotesque } from "next/font/google";
import { APP_NAME, LOCALES, getDictionary, hasLocale } from "@/i18n";
import { DEFAULT_THEME, THEME_COLORS } from "@/constants/theme";
import { SPLASH_SCREENS, splashPath } from "@/constants/splashScreens";
import { DRIVE_SCRIPT, TRAVELPAYOUTS_DRIVE } from "@/constants/travelpayouts";
import { AuthProvider } from "@/providers/AuthProvider";
import ThemeScript from "@/components/layout/ThemeScript";
import InlineScript from "@/components/shared/InlineScript";
import Analytics from "@/components/layout/Analytics";
import { GA_ID } from "@/constants/analytics";
import { TWITTER_CARD, openGraphOf } from "@/utils/metadata";
import "@/styles/globals.css";

const display = Bricolage_Grotesque({ subsets: ["latin"], variable: "--font-display" });
const body = Atkinson_Hyperlegible({ subsets: ["latin"], weight: ["400", "700"], variable: "--font-body" });

// Only /es and /en: the proxy sends any other address to one of them, and the layout makes any other language a 404.
// No dynamicParams = false here: it would reach every page below, and turn into a 404 each route page that is made
// on its first visit (flights/[route])
export const generateStaticParams = () => LOCALES.map((lang) => ({ lang }));

// Absolute address of the site, so shared links get full URLs for the preview image (opengraph-image.js):
// the production domain on Vercel, this machine in development
const SITE_URL = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : `http://localhost:${process.env.PORT || 3000}`;

export const generateMetadata = async ({ params }) => {
  const { lang } = await params;
  // Not a language (Chrome's /.well-known/… probe lands here): the layout below answers 404, no metadata to build
  if (!hasLocale(lang)) return {};
  const { meta } = getDictionary(lang);
  return {
    metadataBase: new URL(SITE_URL),
    title: meta.title,
    description: meta.description,
    applicationName: APP_NAME,
    // Installed on an iPhone home screen: full screen, the header runs under the status bar (it already
    // leaves room for it with env(safe-area-inset-top)), and while it opens, the logo on the night gradient
    // (iOS takes a launch image of each screen's exact size; without one it shows a blank screen)
    appleWebApp: {
      capable: true,
      title: APP_NAME,
      statusBarStyle: "black-translucent",
      startupImage: SPLASH_SCREENS.map((screen) => ({
        url: splashPath(screen),
        media: `screen and (device-width: ${screen.width}px) and (device-height: ${screen.height}px) and (-webkit-device-pixel-ratio: ${screen.ratio}) and (orientation: portrait)`,
      })),
    },
    // Next only writes the standard "mobile-web-app-capable"; Safari on iPhone still needs its own to open the
    // installed app full screen and show the launch images above
    other: { "apple-mobile-web-app-capable": "yes" },
    openGraph: openGraphOf(lang, { title: meta.title, description: meta.description, image: null }),
    twitter: TWITTER_CARD,
    // No canonical or languages here: each page says its own (utils/metadata alternatesOf), or every page without
    // them would claim to be the home
  };
};

// themeColor: the dark default; ThemeToggle updates it when the theme changes
export const viewport = { width: "device-width", initialScale: 1, viewportFit: "cover", themeColor: THEME_COLORS[DEFAULT_THEME] };

const RootLayout = async ({ children, params }) => {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  return (
    // ThemeScript may change data-theme before React hydrates. It opens <body>, so it runs before anything is
    // painted (next/script's beforeInteractive ran too late: a saved light theme flashed dark).
    <html lang={lang} data-theme={DEFAULT_THEME} suppressHydrationWarning className={`${display.variable} ${body.variable}`}>
      <head>{TRAVELPAYOUTS_DRIVE && <InlineScript code={DRIVE_SCRIPT} data-cmp-ab="2" />}</head>
      <body>
        <ThemeScript />
        <AuthProvider lang={lang}>{children}</AuthProvider>
        {GA_ID && <Analytics />}
      </body>
    </html>
  );
};

export default RootLayout;
