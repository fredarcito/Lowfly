import { notFound } from "next/navigation";
import { Atkinson_Hyperlegible, Bricolage_Grotesque } from "next/font/google";
import { APP_NAME, LOCALES, getDictionary, hasLocale } from "@/i18n";
import { DEFAULT_THEME, THEME_COLORS } from "@/constants/theme";
import { themeScript } from "@/utils/theme";
import { ROUTES } from "@/constants/routes";
import { SPLASH_SCREENS, splashPath } from "@/constants/splashScreens";
import { AuthProvider } from "@/providers/AuthProvider";
import { openGraphOf, twitterCardOf } from "@/utils/metadata";
import "@/styles/globals.css";

const display = Bricolage_Grotesque({ subsets: ["latin"], variable: "--font-display" });
const body = Atkinson_Hyperlegible({ subsets: ["latin"], weight: ["400", "700"], variable: "--font-body" });

// Only /es and /en; any other language is a 404
export const dynamicParams = false;
export const generateStaticParams = () => LOCALES.map((lang) => ({ lang }));

// Absolute address of the site, so shared links get full URLs for the preview image (opengraph-image.js):
// the production domain on Vercel, this machine in development
const SITE_URL = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : `http://localhost:${process.env.PORT || 3000}`;

export const generateMetadata = async ({ params }) => {
  const { lang } = await params;
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
    openGraph: openGraphOf(lang, { title: meta.title, description: meta.description }),
    twitter: twitterCardOf({ title: meta.title, description: meta.description }),
    alternates: {
      canonical: ROUTES.home(lang),
      languages: Object.fromEntries(LOCALES.map((locale) => [locale, ROUTES.home(locale)])),
    },
  };
};

// themeColor: the dark default; ThemeToggle updates it when the theme changes
export const viewport = { width: "device-width", initialScale: 1, viewportFit: "cover", themeColor: THEME_COLORS[DEFAULT_THEME] };

const RootLayout = async ({ children, params }) => {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  return (
    // The theme script may change data-theme before React hydrates
    <html lang={lang} data-theme={DEFAULT_THEME} suppressHydrationWarning className={`${display.variable} ${body.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
};

export default RootLayout;
