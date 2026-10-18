import Link from "next/link";
import { ArrowRight, Map } from "lucide-react";
import { Button } from "@/components/ui/button";
import { guideTexts } from "@/components/guides/data/texts";
import { ROUTES } from "@/constants/routes";

// The foot of the guides' page: for a city without a guide, or a trip of one's own, the planner
const PlanBand = ({ lang }) => {
  const texts = guideTexts(lang).list.band;
  return (
    <aside className="flex flex-wrap items-center justify-between gap-4 border-y py-6">
      <div className="flex min-w-0 flex-1 basis-72 items-center gap-4">
        <span className="grid size-12 shrink-0 place-items-center rounded-full bg-muted text-muted-foreground">
          <Map className="size-5" />
        </span>
        <div className="grid gap-0.5">
          <p className="font-heading text-lg font-bold">{texts.title}</p>
          <p className="text-sm text-muted-foreground">{texts.text}</p>
        </div>
      </div>
      <Button asChild variant="outline" className="h-11 border-primary px-5 font-bold text-primary-ink max-sm:w-full dark:border-primary">
        <Link href={ROUTES.newTrip(lang)}>
          {texts.button} <ArrowRight />
        </Link>
      </Button>
    </aside>
  );
};

export default PlanBand;
