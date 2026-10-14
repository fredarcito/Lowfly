"use client";

import { Ellipsis, ExternalLink, Ticket, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import DeleteTripDialog from "@/components/trips/DeleteTripDialog";
import { useI18n } from "@/context/i18n";
import { useDisclosure } from "@/hooks/useDisclosure";
import { useTripActions } from "@/hooks/useTripActions";

// ⋯ quick actions on a trip: mark as booked, book with the airline, delete (asks first; then `onDeleted`)
export default function TripMenu({ trip, onDeleted }) {
  const { t } = useI18n();
  const { toggleBooked, bookingLinks } = useTripActions(trip);
  const deleteDialog = useDisclosure();
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon" className="size-10" aria-label={t.trips.more}>
            <Ellipsis />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-52">
          <DropdownMenuItem onSelect={toggleBooked}>
            <Ticket /> {trip.booked ? t.trips.unmarkBooked : t.trips.markBooked}
          </DropdownMenuItem>
          {bookingLinks.map((link) => (
            <DropdownMenuItem key={link.href} asChild>
              <a href={link.href} target="_blank" rel="noopener noreferrer">
                <ExternalLink /> {link.label}
              </a>
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive" onSelect={deleteDialog.show}>
            <Trash2 /> {t.trips.remove}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <DeleteTripDialog trip={trip} open={deleteDialog.open} onOpenChange={deleteDialog.setOpen} onDeleted={onDeleted} />
    </>
  );
}
