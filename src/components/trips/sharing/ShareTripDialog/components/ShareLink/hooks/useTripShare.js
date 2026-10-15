"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/auth";
import { useI18n } from "@/context/i18n";
import { shareTrip, stopSharing } from "@/store/tripShares";
import { ROUTES } from "@/constants/routes";

const COPIED_FOR = 2000;

// Sharing a trip: its link (created as soon as it is shown, and again with `create` after an error), copying it, sending it with the phone's share sheet
// and turning it off (both resolve with whether it worked). `url` only while shared; status of the last action: "idle" | "working" | "error"
export const useTripShare = (trip) => {
  const { lang, texts } = useI18n();
  const { user } = useAuth();
  const [status, setStatus] = useState("idle");
  const [copied, setCopied] = useState(false);
  const url = trip.shareId && typeof window !== "undefined" ? `${window.location.origin}${ROUTES.sharedTrip(lang, trip.shareId)}` : null;
  const canSend = typeof navigator !== "undefined" && Boolean(navigator.share);

  const run = async (action) => {
    setStatus("working");
    try {
      await action();
      setStatus("idle");
      return true;
    } catch (error) {
      console.error("Sharing a trip", error);
      setStatus("error");
      return false;
    }
  };

  const create = () => run(() => shareTrip(user.id, trip));

  // Showing the link is asking for it: create it once, when it does not exist yet
  useEffect(() => {
    if (!trip.shareId) create();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const stop = () => run(() => stopSharing(trip));

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), COPIED_FOR);
    } catch {} // no clipboard (insecure page): the link is in sight to copy by hand
  };

  const send = () => navigator.share({ title: texts.share.message(trip.fare.city), url }).catch(() => {});

  return { status, url, copied, canSend, create, stop, copy, send };
};
