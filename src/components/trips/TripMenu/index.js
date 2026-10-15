"use client";

import { Ellipsis, ExternalLink, RefreshCw, Ticket, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import DeleteTripDialog from "@/components/trips/DeleteTripDialog";
import { useI18n } from "@/context/i18n";
import { useDisclosure } from "@/hooks/useDisclosure";
import { useTripActions } from "@/hooks/useTripActions";
import { updateTrip } from "@/store/trips";
import { cn } from "@/utils/cn";

// ⋯ quick actions on a trip: mark as booked, book with the airline, redo the itinerary and delete
// (both ask first; after deleting, `onDeleted`). `variant` and `className` restyle the ⋯ button.
// `onRemove`: removes the trip itself once confirmed (see DeleteTripDialog).
const TripMenu = ({ trip, onDeleted, onRemove, variant = "outline", className }) => {
  const { texts } = useI18n();
  const { toggleBooked, bookingLinks } = useTripActions(trip);
  const deleteDialog = useDisclosure();
  const redoDialog = useDisclosure();
  // Back to the "create" card, keeping the preferences
  const redoItinerary = () => updateTrip(trip.id, { itinerary: null, visited: [] });
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant={variant} size="icon" className={cn("size-10", className)} aria-label={texts.trips.more}>
            <Ellipsis />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-52">
          {/* A trip planned by hand has no flights to book */}
          {!trip.manual && (
            <DropdownMenuItem onSelect={toggleBooked}>
              <Ticket /> {trip.booked ? texts.trips.unmarkBooked : texts.trips.markBooked}
            </DropdownMenuItem>
          )}
          {bookingLinks.map((link) => (
            <DropdownMenuItem key={link.href} asChild>
              <a href={link.href} target="_blank" rel="noopener noreferrer">
                <ExternalLink /> {link.label}
              </a>
            </DropdownMenuItem>
          ))}
          {trip.itinerary && (
            <DropdownMenuItem onSelect={redoDialog.show}>
              <RefreshCw /> {texts.trips.redoItinerary}
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive" onSelect={deleteDialog.show}>
            <Trash2 /> {texts.trips.remove}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <ConfirmDialog
        open={redoDialog.open}
        onOpenChange={redoDialog.setOpen}
        icon={RefreshCw}
        title={texts.trips.redoTitle}
        description={texts.trips.redoText}
        confirmLabel={texts.trips.redoConfirm}
        onConfirm={redoItinerary}
      />
      <DeleteTripDialog trip={trip} open={deleteDialog.open} onOpenChange={deleteDialog.setOpen} onDeleted={onDeleted} onRemove={onRemove} />
    </>
  );
};

export default TripMenu;
