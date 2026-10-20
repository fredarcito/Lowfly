import FaqSection from "@/components/shared/FaqSection";
import { guideTexts } from "@/components/guides/data/texts";

// What people ask about the city, answered with the guide (utils/guideFaq), every answer in view
const GuideFaq = ({ lang, city, faq }) => <FaqSection id="guide-faq-title" title={guideTexts(lang).faq.title(city)} faq={faq} />;

export default GuideFaq;
