"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CircleAlert, Loader2, Mail, MailCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/auth";
import { GoogleLogo } from "@/components/account/GoogleLogo";
import { useI18n } from "@/context/i18n";
import { signInWithEmail, signInWithGoogle } from "@/supabase/signIn";
import { ROUTES } from "@/constants/routes";

// Signing in: with Google, or with a link sent by email (no password), then on to `next` (the page they came
// from, or My trips). See supabase/signIn.
export const LoginForm = () => {
  const { lang, texts } = useI18n();
  const { status, user } = useAuth();
  const searchParams = useSearchParams();
  const asked = searchParams.get("next") ?? "";
  const next = asked.startsWith("/") && !asked.startsWith("//") ? asked : ROUTES.trips(lang);
  const [email, setEmail] = useState("");
  const [state, setState] = useState(searchParams.get("error") ? { step: "error" } : { step: "idle" });
  const labels = texts.account;

  const withGoogle = async () => {
    setState({ step: "google" });
    const { error } = await signInWithGoogle(next);
    if (error) setState({ step: "error", message: error.message });
  };

  const withEmail = async (event) => {
    event.preventDefault();
    setState({ step: "sending" });
    const { error } = await signInWithEmail(email.trim(), next, lang);
    setState(error ? { step: "error", message: error.message } : { step: "sent" });
  };

  if (status === "signedIn") {
    return (
      <section className="grid max-w-md gap-4 rounded-xl bg-card p-6 ring-1 ring-foreground/10">
        <p className="font-heading text-xl font-bold">{labels.already(user.email)}</p>
        <Button asChild className="h-11 font-bold">
          <Link href={next}>{labels.continue}</Link>
        </Button>
      </section>
    );
  }

  const busy = state.step === "google" || state.step === "sending";
  return (
    <section className="grid w-full max-w-md gap-5 rounded-xl bg-card p-5 ring-1 ring-foreground/10 sm:p-6">
      <div className="grid gap-1">
        <h1 className="font-heading text-2xl font-extrabold tracking-tight sm:text-3xl">{labels.title}</h1>
        <p className="text-muted-foreground">{labels.subtitle}</p>
      </div>

      {state.step === "sent" ? (
        <div role="status" className="grid gap-2 rounded-lg bg-save/10 p-4">
          <p className="flex items-center gap-2 font-semibold text-save">
            <MailCheck className="size-5" /> {labels.sentTitle}
          </p>
          <p className="text-sm text-muted-foreground">{labels.sentText(email.trim())}</p>
          <Button variant="ghost" size="sm" className="w-fit" onClick={() => setState({ step: "idle" })}>
            {labels.useOtherEmail}
          </Button>
        </div>
      ) : (
        <>
          <Button variant="outline" size="lg" className="h-11 text-base font-semibold" disabled={busy} onClick={withGoogle}>
            {state.step === "google" ? <Loader2 className="animate-spin" /> : <GoogleLogo />} {labels.google}
          </Button>

          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="h-px flex-1 bg-border" />
            {labels.orEmail}
            <span className="h-px flex-1 bg-border" />
          </div>

          <form onSubmit={withEmail} className="grid gap-3">
            <div className="grid gap-1.5">
              <Label htmlFor="login-email" className="text-muted-foreground">
                {labels.email}
              </Label>
              <Input
                id="login-email"
                type="email"
                required
                autoComplete="email"
                placeholder={labels.emailPlaceholder}
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="h-11 text-base md:text-sm"
              />
            </div>
            <Button type="submit" size="lg" className="h-11 text-base font-bold" disabled={busy || !email.trim()}>
              {state.step === "sending" ? <Loader2 className="animate-spin" /> : <Mail />} {labels.sendLink}
            </Button>
            <p className="text-xs text-muted-foreground">{labels.noPassword}</p>
          </form>
        </>
      )}

      {state.step === "error" && (
        <p role="alert" className="flex gap-2 rounded-lg bg-destructive/10 px-3 py-2.5 text-sm text-destructive">
          <CircleAlert className="mt-0.5 size-4 shrink-0" /> {labels.error}
        </p>
      )}
      <p className="text-xs text-muted-foreground">
        {labels.why}{" "}
        {labels.legalNote(
          <Link key="terms" href={ROUTES.terms(lang)} className="underline underline-offset-2 hover:text-foreground">
            {labels.terms.toLowerCase()}
          </Link>,
          <Link key="privacy" href={ROUTES.privacy(lang)} className="underline underline-offset-2 hover:text-foreground">
            {labels.privacy.toLowerCase()}
          </Link>
        )}
      </p>
    </section>
  );
};
