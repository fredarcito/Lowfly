"use client";

import { useState } from "react";
import { track } from "@/utils/analytics";

const COPIED_FOR = 2000;

// Sharing a page of this site that anyone may open (a city guide), in the share dialog: its link, copying it and
// sending it with the device's share sheet. `path`: the page's; `message`: what the share sheet sends with it;
// `analytics`: { content_type, item_id }, counted as Google Analytics' "share" with how it went.
// → { url, copied, canSend, copy, send } (copied: the link was just copied, for a moment)
export const useShareLink = ({ path, message, analytics }) => {
  const [copied, setCopied] = useState(false);
  const url = typeof window !== "undefined" ? `${window.location.origin}${path}` : path;
  const canSend = typeof navigator !== "undefined" && Boolean(navigator.share);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      track("share", { ...analytics, method: "copy_link" });
      setCopied(true);
      setTimeout(() => setCopied(false), COPIED_FOR);
    } catch {} // no clipboard (an insecure page): the link is in sight to copy by hand
  };

  const send = async () => {
    try {
      await navigator.share({ title: message, url });
      track("share", { ...analytics, method: "share_sheet" });
    } catch {} // closed without sharing
  };

  return { url, copied, canSend, copy, send };
};
