"use client";

import Link from "next/link";
import { CloudOff, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/context/i18n";
import { ROUTES } from "@/constants/routes";

// Signed out with trips saved: they only live in this browser. Say so, and offer to keep them in an account
// (signing in adds them to it)
const LocalTripsNotice = () => {
  const { lang, texts } = useI18n();
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-3 rounded-xl bg-muted/60 px-4 py-3 ring-1 ring-foreground/10 sm:px-5">
      <CloudOff className="size-5 shrink-0 text-muted-foreground" />
      <p className="min-w-0 flex-1 text-sm">
        <span className="font-semibold">{texts.trips.localOnly}</span>{" "}
        <span className="text-muted-foreground">{texts.trips.localOnlyHint}</span>
      </p>
      <Button asChild variant="outline" className="h-9 font-semibold max-sm:w-full">
        <Link href={ROUTES.login(lang, ROUTES.trips(lang))}>
          <LogIn /> {texts.account.signIn}
        </Link>
      </Button>
    </div>
  );
};

export default LocalTripsNotice;
