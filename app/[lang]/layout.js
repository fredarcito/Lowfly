import { notFound } from "next/navigation";
import { Atkinson_Hyperlegible, Bricolage_Grotesque } from "next/font/google";
import { APP_NAME, LOCALES, getDictionary, hasLocale } from "@/lib/i18n";
import { DEFAULT_THEME, themeScript } from "@/lib/theme";

// Travelpayouts Drive: required by Travelpayouts to verify the site (for its flight data API).
// Only loaded with TRAVELPAYOUTS_DRIVE=on (Vercel environment variable, read at build time).
// Its features (link conversion, recommendation blocks) are switched off in the Travelpayouts dashboard.
const travelpayoutsDrive = process.env.TRAVELPAYOUTS_DRIVE === "on";
const driveScript = `(function(){var s=document.createElement("script");s.async=1;s.setAttribute("data-cmp-ab","2");s.src="https://emrld.ltd/NTg1MjE4.js?t=585218";document.head.appendChild(s)})()`;
import "../globals.css";

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
    openGraph: { siteName: APP_NAME, title: meta.title, description: meta.description, locale: lang },
    alternates: {
      canonical: `/${lang}`,
      languages: Object.fromEntries(LOCALES.map((l) => [l, `/${l}`])),
    },
  };
}

export const viewport = { width: "device-width", initialScale: 1, viewportFit: "cover" };

export default async function RootLayout({ children, params }) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  return (
    // The theme script may change data-theme before React hydrates
    <html lang={lang} data-theme={DEFAULT_THEME} suppressHydrationWarning className={`${display.variable} ${body.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        {travelpayoutsDrive && <script data-cmp-ab="2" dangerouslySetInnerHTML={{ __html: driveScript }} />}
      </head>
      <body>{children}</body>
    </html>
  );
}
