"use client";

import { Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/context/i18n";
import { cn } from "@/utils/cn";

// "Share" over a photo, on glass (a trip's header, a guide's header and card). `compact`: only the icon on phones.
const ShareTrigger = ({ onClick, compact = false, className }) => {
  const { texts } = useI18n();
  return (
    <Button
      variant="ghost"
      onClick={onClick}
      aria-label={texts.share.action}
      className={cn(
        "h-10 rounded-full bg-hero-chip px-4 font-semibold text-hero-foreground backdrop-blur-sm hover:bg-hero-chip hover:text-hero-foreground dark:hover:bg-hero-chip",
        compact && "max-sm:w-10 max-sm:px-0",
        className
      )}
    >
      <Share2 /> <span className={cn(compact && "max-sm:sr-only")}>{texts.share.action}</span>
    </Button>
  );
};

export default ShareTrigger;
