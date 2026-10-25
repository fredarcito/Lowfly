"use client";

import { usePathname } from "next/navigation";
import { Plane } from "lucide-react";
import { Button } from "@/components/ui/button";
import InstallSteps from "@/components/shared/InstallSteps";
import { useI18n } from "@/context/i18n";
import { useDisclosure } from "@/hooks/useDisclosure";
import { useInstallApp } from "@/hooks/useInstallApp";
import { ROUTES } from "@/constants/routes";
import { useBannerDismissed } from "./hooks/useBannerDismissed";
import { useDelayPassed } from "./hooks/useDelayPassed";

// Not as the page opens, while the visitor is about to search: once they have been on the home for a while
export const BANNER_DELAY = 20_000;

// Phones, on the home only: a small card at the bottom that tells Lowfly can live on the home screen. "Install" opens
// the browser's dialog (Android) or the steps (iPhone); either button closes it for good in this browser. Not shown once
// installed, nor where the browser cannot install. The settings menu keeps the same action for later.
const InstallBanner = () => {
  const { lang, texts } = useI18n();
  const pathname = usePathname();
  const { way, install } = useInstallApp();
  const { dismissed, dismiss } = useBannerDismissed();
  const steps = useDisclosure();
  const delayPassed = useDelayPassed(BANNER_DELAY);
  const words = texts.install;

  const shown = delayPassed && pathname === ROUTES.home(lang) && way && !dismissed;

  // Acting on it closes the banner for good too: the steps (or the browser's dialog) take over, and the settings menu
  // keeps the action for later
  const startInstall = () => {
    dismiss();
    if (way === "prompt") install();
    else steps.show();
  };

  return (
    <>
      {shown && (
        <aside
          aria-label={words.banner.label}
          className="fixed inset-x-3 bottom-[calc(0.75rem+env(safe-area-inset-bottom,0px))] z-40 grid gap-3 rounded-2xl bg-popover/95 p-4 text-popover-foreground shadow-xl ring-1 ring-foreground/10 backdrop-blur-md duration-500 ease-out animate-in slide-in-from-bottom-8 fade-in-0 motion-reduce:animate-none md:hidden"
        >
          <div className="flex items-center gap-3.5">
            <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground">
              <Plane className="size-5 -rotate-45" />
            </span>
            <div className="grid min-w-0 gap-1">
              <p className="font-heading text-base leading-tight font-bold">{words.banner.title}</p>
              <p className="text-sm leading-snug text-muted-foreground">{words.banner.text}</p>
            </div>
          </div>
          {/* The actions on their own row, as in a dialog: the text keeps the card's width */}
          <div className="flex justify-end gap-2">
            <Button variant="ghost" className="h-9 px-3 text-muted-foreground" onClick={dismiss}>
              {words.banner.dismiss}
            </Button>
            <Button variant="outline" className="h-9 px-4 font-semibold" onClick={startInstall}>
              {words.action}
            </Button>
          </div>
        </aside>
      )}
      <InstallSteps open={steps.open} onOpenChange={steps.setOpen} />
    </>
  );
};

export default InstallBanner;
