"use client";

import { Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import ShareTripDialog from "@/components/trips/sharing/ShareTripDialog";
import { useI18n } from "@/context/i18n";
import { useDisclosure } from "@/hooks/useDisclosure";
import { cn } from "@/utils/cn";

// "Share" on a trip's photo header, on glass like the ⋯ next to it (only the icon on phones)
const ShareTripButton = ({ trip, className }) => {
  const { texts } = useI18n();
  const dialog = useDisclosure();
  return (
    <>
      <Button
        variant="ghost"
        onClick={dialog.show}
        aria-label={texts.share.action}
        className={cn(
          "h-10 rounded-full bg-hero-chip px-4 font-semibold text-hero-foreground backdrop-blur-sm hover:bg-hero-chip hover:text-hero-foreground max-sm:w-10 max-sm:px-0 dark:hover:bg-hero-chip",
          className
        )}
      >
        <Share2 /> <span className="max-sm:sr-only">{texts.share.action}</span>
      </Button>
      <ShareTripDialog trip={trip} open={dialog.open} onOpenChange={dialog.setOpen} />
    </>
  );
};

export default ShareTripButton;
