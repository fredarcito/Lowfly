"use client";

import { useState, useTransition } from "react";
import { Loader2, Share2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import ItineraryCost from "@/components/admin/UserDetail/components/TripItem/components/ItineraryCost";
import { useAdmin } from "@/components/admin/hooks/useAdmin";
import { deleteItinerary } from "@/server/admin/actions";

// One of the account's trips: where and when, whether it is booked or shared, and its itinerary with what the AI
// cost to make it (tokens in + out and dollars; the total too when it was made again), which the admin can
// delete (after confirming: it cannot be undone)
const TripItem = ({ userId, trip }) => {
  const { texts: all, format } = useAdmin();
  const texts = all.user;
  const [asking, setAsking] = useState(false);
  const [error, setError] = useState(null);
  const [deleting, startDeleting] = useTransition();
  const remove = () =>
    startDeleting(async () => {
      const result = await deleteItinerary(userId, trip.id);
      setError(result.error ?? null);
    });

  return (
    <li className="flex items-center gap-x-4 gap-y-2.5 py-3 first:pt-0 last:pb-0 max-sm:flex-col max-sm:items-start">
      <div className="grid min-w-0 flex-1 gap-0.5">
        <p className="flex min-w-0 items-center gap-2 font-medium">
          <span className="truncate">{trip.title}</span>
          {trip.shared && <Share2 className="size-3.5 shrink-0 text-muted-foreground" aria-label={texts.sharedTrip} />}
        </p>
        <p className="text-sm text-muted-foreground">
          {trip.from ? format.day(trip.from) : "—"}
          {trip.to && ` → ${format.day(trip.to)}`}
          {trip.manual && ` · ${texts.manual}`}
          {trip.booked && ` · ${texts.booked}`}
          {` · ${trip.itineraryDays ? texts.itineraryDays(trip.itineraryDays) : texts.noItinerary}`}
        </p>
        {trip.itineraryDays > 0 && <ItineraryCost cost={trip.aiCost} />}
        {error && <p className="text-sm text-destructive">{texts.deleteError(error)}</p>}
      </div>
      {trip.itineraryDays > 0 && (
        <Button variant="outline" size="sm" onClick={() => setAsking(true)} disabled={deleting} className="text-destructive">
          {deleting ? <Loader2 className="animate-spin" /> : <Trash2 />}
          {texts.deleteItinerary}
        </Button>
      )}
      <ConfirmDialog
        open={asking}
        onOpenChange={setAsking}
        icon={Trash2}
        title={texts.confirmTitle}
        description={texts.confirmText(trip.title)}
        confirmLabel={texts.deleteItinerary}
        onConfirm={remove}
        destructive
      />
    </li>
  );
};

export default TripItem;
