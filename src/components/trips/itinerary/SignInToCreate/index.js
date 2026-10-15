"use client";

import { useState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GoogleLogo } from "@/components/account/GoogleLogo";
import { useI18n } from "@/context/i18n";
import { signInWithGoogle } from "@/supabase/signIn";
import { ROUTES } from "@/constants/routes";

// The free itinerary is used: sign in (Google in one click, or any other way) and come back to this trip,
// whose trips are then in the account (store/tripsCloud), to create it
const SignInToCreate = ({ next }) => {
  const { lang, texts } = useI18n();
  const [leaving, setLeaving] = useState(false);
  const labels = texts.trips.signInToCreate;
  const withGoogle = async () => {
    setLeaving(true);
    const { error } = await signInWithGoogle(next);
    if (error) setLeaving(false);
  };
  return (
    <div className="grid gap-4 rounded-xl bg-selected p-4 sm:p-5 lg:flex lg:items-center lg:justify-between">
      <div className="grid gap-1">
        <p className="font-heading font-bold">{labels.title}</p>
        <p className="max-w-[60ch] text-sm text-muted-foreground">{labels.text}</p>
      </div>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center lg:shrink-0">
        <Button size="lg" className="h-11 px-5 text-base font-bold" disabled={leaving} onClick={withGoogle}>
          {leaving ? (
            <Loader2 className="animate-spin" />
          ) : (
            // Google's logo keeps its colours on a white disc (its guidelines), also on the coral button
            <span className="grid size-6 place-items-center rounded-full bg-white">
              <GoogleLogo />
            </span>
          )}{" "}
          {texts.account.google}
        </Button>
        <Button asChild variant="ghost" size="lg" className="h-11">
          <Link href={ROUTES.login(lang, next)}>{labels.otherWays}</Link>
        </Button>
      </div>
    </div>
  );
};

export default SignInToCreate;
