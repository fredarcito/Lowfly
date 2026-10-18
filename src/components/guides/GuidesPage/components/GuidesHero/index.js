import PhotoBackdrop from "@/components/shared/PhotoBackdrop";
import { guideTexts } from "@/components/guides/data/texts";

// The top of the guides' page, over a photo fading into the page, as on every page with a photo header: Budapest
// at night, the Parliament on the right, where the header shows it (the left fades under the text), with some night
// sky added above its dome and kept by the top, so the dome is never cut. Kept in public/guides at 800 and 1600 px
// wide. Not any guide's own city: the page is about all of them.
const PHOTO = {
  src: "/guides/budapest-parliament-night-800.webp",
  srcSet: "/guides/budapest-parliament-night-800.webp 800w, /guides/budapest-parliament-night-1600.webp 1600w",
};

const GuidesHero = ({ lang }) => {
  const texts = guideTexts(lang).list;
  return (
    <div className="grid gap-4 pt-4 pb-2 sm:pt-2 sm:pb-6">
      <PhotoBackdrop image={PHOTO} photo={null} alignTop />
      <h1 className="font-heading text-4xl leading-[1.05] font-extrabold tracking-tight drop-shadow-sm sm:text-6xl">{texts.title}</h1>
      <p className="max-w-[46ch] text-hero-muted sm:text-lg">{texts.intro}</p>
    </div>
  );
};

export default GuidesHero;
