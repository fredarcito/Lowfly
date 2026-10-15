"use client";

import Link from "next/link";
import { BookmarkPlus, Loader2, Luggage } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/context/i18n";
import { useSaveSharedTrip } from "@/components/trips/sharing/SaveSharedTripButton/hooks/useSaveSharedTrip";
import { cn } from "@/utils/cn";

// "Save to my trips" for a shared trip; once saved, "See in my trips"
const SaveSharedTripButton = ({ trip, className }) => {
  const { texts } = useI18n();
  const { saved, href, save, busy } = useSaveSharedTrip(trip);
  if (saved) {
    return (
      <Button asChild className={cn("h-11 px-5 font-bold", className)}>
        <Link href={href}>
          <Luggage /> {texts.share.open}
        </Link>
      </Button>
    );
  }
  return (
    <Button onClick={save} disabled={busy} className={cn("h-11 px-5 font-bold", className)}>
      {busy ? <Loader2 className="animate-spin" /> : <BookmarkPlus />} {texts.share.save}
    </Button>
  );
};

export default SaveSharedTripButton;
