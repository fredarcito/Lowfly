"use client";

import ShareTrigger from "@/components/shared/ShareTrigger";
import ShareTripDialog from "@/components/trips/sharing/ShareTripDialog";
import { useDisclosure } from "@/hooks/useDisclosure";

// "Share" on a trip's photo header, on glass like the ⋯ next to it (only the icon on phones)
const ShareTripButton = ({ trip, className }) => {
  const dialog = useDisclosure();
  return (
    <>
      <ShareTrigger onClick={dialog.show} compact className={className} />
      <ShareTripDialog trip={trip} open={dialog.open} onOpenChange={dialog.setOpen} />
    </>
  );
};

export default ShareTripButton;
