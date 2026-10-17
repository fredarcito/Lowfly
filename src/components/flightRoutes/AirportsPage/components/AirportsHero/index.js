import PhotoBackdrop from "@/components/shared/PhotoBackdrop";
import { routeTexts } from "@/components/flightRoutes/data/texts";
import { travelPhoto } from "@/utils/fallbackPhoto";

// The top of the airports' page (/es/flights), over a wing at sunset (the 404 has the blue one): "Cheap flights by airport" and how many
const AirportsHero = ({ lang, count }) => {
  const texts = routeTexts(lang).airportsPage;
  return (
    <div className="grid gap-4 pt-4 pb-2 sm:pt-8 sm:pb-6">
      <PhotoBackdrop image={travelPhoto("sun")} photo={null} />
      <h1 className="max-w-[16ch] font-heading text-4xl leading-[1.05] font-extrabold tracking-tight drop-shadow-sm sm:text-6xl">{texts.title}</h1>
      <p className="max-w-[55ch] text-hero-muted sm:text-lg">{texts.intro(count)}</p>
    </div>
  );
};

export default AirportsHero;
