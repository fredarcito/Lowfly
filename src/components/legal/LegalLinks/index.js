"use client";

import Link from "next/link";
import { useI18n } from "@/context/i18n";
import { ROUTES } from "@/constants/routes";

const LINK = "underline underline-offset-2 hover:text-foreground";

// "Privacy policy · Terms of use", inline in a small print line
const LegalLinks = () => {
  const { lang, texts } = useI18n();
  return (
    <>
      <Link href={ROUTES.privacy(lang)} className={LINK}>
        {texts.account.privacy}
      </Link>
      {" · "}
      <Link href={ROUTES.terms(lang)} className={LINK}>
        {texts.account.terms}
      </Link>
    </>
  );
};

export default LegalLinks;
