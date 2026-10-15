"use client";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useAuth } from "@/context/auth";
import { useI18n } from "@/context/i18n";
import SignInToShare from "@/components/trips/sharing/ShareTripDialog/components/SignInToShare";
import ShareLink from "@/components/trips/sharing/ShareTripDialog/components/ShareLink";

// "Share" on a trip: its link, or signing in first
const ShareTripDialog = ({ trip, open, onOpenChange }) => {
  const { texts } = useI18n();
  const { status } = useAuth();
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent closeLabel={texts.picker.close}>
        {status === "signedIn" ? <ShareLink trip={trip} onStopped={() => onOpenChange(false)} /> : <SignInToShare />}
      </DialogContent>
    </Dialog>
  );
};

export default ShareTripDialog;
