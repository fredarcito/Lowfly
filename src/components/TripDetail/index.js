"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import DeleteTripDialog from "@/components/DeleteTripDialog";
import Itinerary from "@/components/Itinerary";
import TripFlights from "@/components/TripFlights";
import TripHero from "@/components/TripHero";
import { useI18n } from "@/context/i18n";
import { useDisclosure } from "@/hooks/useDisclosure";
import { ROUTES } from "@/constants/routes";

// One saved trip: photo, flights, itinerary and "Delete trip"
export default function TripDetail({ trip }) {
  const { lang, t } = useI18n();
  const router = useRouter();
  const deleteDialog = useDisclosure();
  const backToList = () => router.replace(ROUTES.trips(lang));

  return (
    <>
      <Link
        href={ROUTES.trips(lang)}
        className="flex w-fit items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> {t.trips.back}
      </Link>

      <TripHero trip={trip} />
      <TripFlights trip={trip} />
      <Itinerary trip={trip} />

      <Button variant="ghost" onClick={deleteDialog.show} className="justify-self-start text-muted-foreground hover:text-destructive">
        <Trash2 /> {t.trips.remove}
      </Button>
      <DeleteTripDialog trip={trip} open={deleteDialog.open} onOpenChange={deleteDialog.setOpen} onDeleted={backToList} />
    </>
  );
}
