import { notFound } from "next/navigation";
import { Atkinson_Hyperlegible, Bricolage_Grotesque } from "next/font/google";
import { APP_NAME, LOCALES, getDictionary, hasLocale } from "@/lib/i18n";
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
    <html lang={lang} className={`${display.variable} ${body.variable}`}>
      <body>{children}</body>
    </html>
  );
}
