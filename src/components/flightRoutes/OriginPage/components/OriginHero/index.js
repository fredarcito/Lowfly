import PhotoBackdrop from "@/components/shared/PhotoBackdrop";
import { routeTexts } from "@/components/flightRoutes/data/texts";
import { fallbackPhoto } from "@/utils/fallbackPhoto";

// The top of an airport's page (/es/flights/malta), over its own photo (a generic travel one without it): "Cheap
// flights from Malta" and how many destinations it has
const OriginHero = ({ lang, origin, count, photo }) => {
  const texts = routeTexts(lang).originPage;
  return (
    <div className="grid gap-4 pt-4 pb-2 sm:pt-2 sm:pb-6">
      <PhotoBackdrop image={photo ?? fallbackPhoto(origin.code)} photo={photo} alt={routeTexts(lang).photoAlt(origin.city)} />
      <h1 className="max-w-[16ch] font-heading text-4xl leading-[1.05] font-extrabold tracking-tight drop-shadow-sm sm:text-6xl">{texts.title(origin.city)}</h1>
      <p className="max-w-[55ch] text-hero-muted sm:text-lg">{texts.intro(count)}</p>
    </div>
  );
};

export default OriginHero;
