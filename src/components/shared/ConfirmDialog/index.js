"use client";

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
import { cn } from "@/utils/cn";

// Asks before an action that cannot be undone. `destructive` paints the confirm button red.
const ConfirmDialog = ({ open, onOpenChange, icon: Icon, title, description, confirmLabel, onConfirm, destructive }) => {
  const { texts } = useI18n();
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <div className="flex gap-4">
          {Icon && (
            <span
              className={cn(
                "grid size-11 shrink-0 place-items-center rounded-full",
                destructive ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary-ink"
              )}
            >
              <Icon className="size-5" />
            </span>
          )}
          <div className="grid gap-1.5">
            <AlertDialogTitle>{title}</AlertDialogTitle>
            <AlertDialogDescription>{description}</AlertDialogDescription>
          </div>
        </div>
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <AlertDialogCancel asChild>
            <Button variant="outline" className="h-10 px-4">
              {texts.trips.cancel}
            </Button>
          </AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button
              onClick={onConfirm}
              className={cn("h-10 px-4 font-semibold", destructive && "bg-destructive text-white hover:bg-destructive/90")}
            >
              {Icon && <Icon />} {confirmLabel}
            </Button>
          </AlertDialogAction>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ConfirmDialog;
