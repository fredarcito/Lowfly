import en from "@/components/admin/data/texts/en";
import es from "@/components/admin/data/texts/es";

// The admin's words in the page's language
export const adminTexts = (lang) => (lang === "en" ? en : es);
