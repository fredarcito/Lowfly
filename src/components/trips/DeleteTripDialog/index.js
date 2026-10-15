"use client";

import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useI18n } from "@/context/i18n";
import { removeTrip } from "@/store/trips";

// Asks before deleting a saved trip (and its itinerary). `onDeleted` runs after removing it. `onRemove`, if given,
// removes it instead (a card that folds away first, then removes it).
const DeleteTripDialog = ({ trip, open, onOpenChange, onDeleted, onRemove }) => {
  const { texts, format } = useI18n();
  const { fare } = trip;
  const dates = fare.ret ? format.fmtRange(fare.day, fare.ret.day) : format.fmtDay(fare.day);

  const remove = () => {
    onDeleted?.();
    if (onRemove) onRemove();
    else removeTrip(trip.id);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <div className="flex gap-4">
          <span className="grid size-11 shrink-0 place-items-center rounded-full bg-destructive/10 text-destructive">
            <Trash2 className="size-5" />
          </span>
          <div className="grid gap-1.5">
            <AlertDialogTitle>{texts.trips.removeTitle}</AlertDialogTitle>
            <AlertDialogDescription>
              {texts.trips.removeText(fare.city, dates, Boolean(trip.itinerary))}
            </AlertDialogDescription>
          </div>
        </div>
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <AlertDialogCancel asChild>
            <Button variant="outline" className="h-10 px-4">
              {texts.trips.cancel}
            </Button>
          </AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button onClick={remove} className="h-10 bg-destructive px-4 font-semibold text-white hover:bg-destructive/90">
              <Trash2 /> {texts.trips.remove}
            </Button>
          </AlertDialogAction>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteTripDialog;
