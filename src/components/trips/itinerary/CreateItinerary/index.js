"use client";

import { useState } from "react";
import Link from "next/link";
import { BedDouble, CircleAlert, Gauge, Loader2, Sparkles, TrainFront, Utensils } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GoogleLogo } from "@/components/account/GoogleLogo";
import PreferencePicker from "@/components/trips/itinerary/PreferencePicker";
import { useAuth } from "@/context/auth";
import { useI18n } from "@/context/i18n";
import { errorMessage } from "@/i18n";
import { useItineraryPreferences } from "@/hooks/useItineraryPreferences";
import { CHECK_IN_TIMES, INTERESTS, PACES, TRANSPORTS } from "@/constants/itineraryPreferences";
import { cn } from "@/utils/cn";
import { guestItineraries } from "@/store/guestItineraries";
import { signInWithGoogle } from "@/supabase/signIn";
import { ITINERARY_LIMITS } from "@/constants/itineraryLimits";
import { ROUTES } from "@/constants/routes";

// The free itinerary is used: sign in (Google in one click, or any other way) and come back to this trip,
// whose trips are then in the account (store/tripsCloud), to create it
const SignInToCreate = ({ next }) => {
  const { lang, t } = useI18n();
  const [leaving, setLeaving] = useState(false);
  const labels = t.trips.signInToCreate;
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
          {t.account.google}
        </Button>
        <Button asChild variant="ghost" size="lg" className="h-11">
          <Link href={ROUTES.login(lang, next)}>{labels.otherWays}</Link>
        </Button>
      </div>
    </div>
  );
};

// No itinerary yet: what the AI makes, the visitor's preferences and the button to create it.
// Same layout as the search form: labelled fields in equal columns, then a note and the button.
// `creation`: { status: "idle" | "creating" | "error", error } while the AI works on it
const CreateItinerary = ({ trip, onCreate, creation }) => {
  const { lang, t } = useI18n();
  const { status } = useAuth();
  // Without an account, once the free itinerary is used (in this browser, or the server says so): sign in first
  const needsAccount =
    status === "signedOut" && (guestItineraries() >= ITINERARY_LIMITS.freeInBrowser || creation.error?.code === "aiSignIn");
  const { preferences, setPace, setTransport, setCheckIn, toggleInterest } = useItineraryPreferences(trip);
  const { fare } = trip;
  const nights = fare.ret ? fare.nights : 0;
  const labels = t.trips.preferences;
  const optionsOf = (ids, names) => ids.map((id) => ({ id, label: names[id] }));
  const creating = creation.status === "creating";

  return (
    <section className="grid gap-5 rounded-xl bg-card p-4 ring-1 ring-foreground/10 sm:p-6">
      <div className="flex gap-3">
        <Sparkles className="mt-0.5 size-6 shrink-0 text-primary-ink" />
        <div className="grid gap-0.5">
          <h2 className="font-heading text-xl font-bold tracking-tight">{t.trips.aiTitle(nights + 1, fare.city)}</h2>
          <p className="max-w-[65ch] text-sm text-muted-foreground">{t.trips.aiText(nights, trip.manual && trip.stops.length > 1)}</p>
        </div>
      </div>

      {/* A trip planned by hand has no check-in: one time could not fit every town, and its arrival times
          already tell the AI when to check in (server/itinerary) */}
      <fieldset disabled={creating} className={cn("grid gap-4 disabled:opacity-60 sm:grid-cols-2", trip.manual ? "lg:grid-cols-3" : "lg:grid-cols-4")}>
        <PreferencePicker
          id="pace"
          icon={Gauge}
          label={labels.pace}
          options={optionsOf(PACES, labels.paces)}
          value={preferences.pace}
          onChange={setPace}
        />
        <PreferencePicker
          id="interests"
          icon={Utensils}
          label={labels.interests}
          options={optionsOf(INTERESTS, labels.interestNames)}
          values={preferences.interests}
          onToggle={toggleInterest}
        />
        <PreferencePicker
          id="transport"
          icon={TrainFront}
          label={labels.transport}
          options={optionsOf(TRANSPORTS, labels.transports)}
          value={preferences.transport}
          onChange={setTransport}
        />
        {!trip.manual && (
          <PreferencePicker
            id="check-in"
            icon={BedDouble}
            label={labels.checkIn}
            options={CHECK_IN_TIMES.map((time) => ({ id: time, label: time }))}
            value={preferences.checkIn}
            onChange={setCheckIn}
          />
        )}
      </fieldset>

      {creation.status === "error" && !needsAccount && (
        <p role="alert" className="flex gap-2 rounded-lg bg-destructive/10 px-3 py-2.5 text-sm text-destructive">
          <CircleAlert className="mt-0.5 size-4 shrink-0" />
          <span>
            {errorMessage(t, creation.error.code, creation.error.params)}
            {creation.error.retry && ` ${t.errors.retry}`}
          </span>
        </p>
      )}

      {needsAccount ? (
        <SignInToCreate next={ROUTES.trip(lang, trip.id)} />
      ) : (
        <div className="flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground" aria-live="polite">
            {creating ? t.trips.aiCreating : t.trips.aiNote}
          </p>
          <Button size="lg" disabled={creating} className="h-11 shrink-0 px-6 text-base font-bold" onClick={() => onCreate(preferences)}>
            {creating ? <Loader2 className="animate-spin" /> : <Sparkles />}
            {creating ? t.trips.aiGenerating : t.trips.aiGenerate}
          </Button>
        </div>
      )}
    </section>
  );
};

export default CreateItinerary;
