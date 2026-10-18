"use client";

import Link from "next/link";
import { LogIn, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/context/i18n";
import { ROUTES } from "@/constants/routes";
import DialogHeading from "@/components/shared/DialogHeading";

// Signed out: links live in the account (so they can be turned off), so sign in first and come back here
const SignInToShare = () => {
  const { lang, texts } = useI18n();
  const here = typeof window !== "undefined" ? `${window.location.pathname}${window.location.search}` : ROUTES.trips(lang);
  return (
    <>
      <DialogHeading icon={Share2} title={texts.share.signInTitle} description={texts.share.signInText} />
      <Button asChild className="h-11 font-bold">
        <Link href={ROUTES.login(lang, here)}>
          <LogIn /> {texts.share.signIn}
        </Link>
      </Button>
    </>
  );
};

export default SignInToShare;
