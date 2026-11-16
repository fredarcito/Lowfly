"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import ErrorNote from "@/components/shared/ErrorNote";
import { useAudioGuide } from "@/context/audioGuide";
import { useI18n } from "@/context/i18n";
import { ROUTES } from "@/constants/routes";

// Why the guide could not be had, and the way out: signing in (a new guide needs an account) or trying again
const GuideError = () => {
  const { texts, lang } = useI18n();
  const pathname = usePathname();
  const player = useAudioGuide();
  const words = texts.trips.audioGuide;
  const { error } = player;

  return (
    <div className="grid gap-3 py-4">
      <ErrorNote error={error} />
      {error.code === "audioSignIn" ? (
        <Button asChild className="h-11">
          <Link href={ROUTES.login(lang, pathname)}>{words.signIn}</Link>
        </Button>
      ) : (
        error.retry && (
          <Button variant="outline" onClick={player.retry} className="h-11">
            {words.retry}
          </Button>
        )
      )}
    </div>
  );
};

export default GuideError;
