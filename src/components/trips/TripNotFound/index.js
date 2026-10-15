"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/context/i18n";
import { ROUTES } from "@/constants/routes";

// A trip link whose trip is no longer saved on this device
const TripNotFound = () => {
  const { lang, texts } = useI18n();
  return (
    <div className="grid justify-items-center gap-3 rounded-xl border border-dashed px-6 py-12 text-center">
      <p className="text-muted-foreground">{texts.trips.notFound}</p>
      <Button asChild variant="outline">
        <Link href={ROUTES.trips(lang)}>
          <ArrowLeft /> {texts.trips.back}
        </Link>
      </Button>
    </div>
  );
};

export default TripNotFound;
