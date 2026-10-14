import { notFound } from "next/navigation";
import { Atkinson_Hyperlegible, Bricolage_Grotesque } from "next/font/google";
import { APP_NAME, LOCALES, getDictionary, hasLocale } from "@/i18n";
import { DEFAULT_THEME, THEME_COLORS } from "@/constants/theme";
import { themeScript } from "@/utils/theme";
import { ROUTES } from "@/constants/routes";
import "@/styles/globals.css";

const display = Bricolage_Grotesque({ subsets: ["latin"], variable: "--font-display" });
const body = Atkinson_Hyperlegible({ subsets: ["latin"], weight: ["400", "700"], variable: "--font-body" });

// Only /es and /en; any other language is a 404
export const dynamicParams = false;
export const generateStaticParams = () => LOCALES.map((lang) => ({ lang }));

export async function generateMetadata({ params }) {
  const { lang } = await params;
  const { meta } = getDictionary(lang);
  return {
    title: meta.title,
    description: meta.description,
    applicationName: APP_NAME,
    // Installed on an iPhone home screen: full screen, the header runs under the status bar (it already
    // leaves room for it with env(safe-area-inset-top))
    appleWebApp: { capable: true, title: APP_NAME, statusBarStyle: "black-translucent" },
    openGraph: { siteName: APP_NAME, title: meta.title, description: meta.description, locale: lang },
    alternates: {
      canonical: ROUTES.home(lang),
      languages: Object.fromEntries(LOCALES.map((locale) => [locale, ROUTES.home(locale)])),
    },
  };
}

// themeColor: the dark default; ThemeToggle updates it when the theme changes
export const viewport = { width: "device-width", initialScale: 1, viewportFit: "cover", themeColor: THEME_COLORS[DEFAULT_THEME] };

export default async function RootLayout({ children, params }) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  return (
    // The theme script may change data-theme before React hydrates
    <html lang={lang} data-theme={DEFAULT_THEME} suppressHydrationWarning className={`${display.variable} ${body.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
