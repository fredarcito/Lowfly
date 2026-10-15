"use client";

import { Check, Copy, Link2, Link2Off, Loader2, Send, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import FieldAlert from "@/components/shared/FieldAlert";
import { useI18n } from "@/context/i18n";
import { useTripShare } from "@/components/trips/sharing/ShareTripDialog/components/ShareLink/hooks/useTripShare";
import DialogHeading from "@/components/trips/sharing/ShareTripDialog/components/DialogHeading";

// The link, created when the dialog opens: copy it, send it (phones' share sheet) or turn it off (`onStopped`)
const ShareLink = ({ trip, onStopped }) => {
  const { texts } = useI18n();
  const { status, url, copied, canSend, create, stop, copy, send } = useTripShare(trip);
  const working = status === "working";

  return (
    <>
      <DialogHeading icon={Share2} title={texts.share.title} description={texts.share.text} />

      {url ? (
        <div className="grid gap-3">
          <div className="flex items-center gap-2 rounded-xl bg-muted/60 p-1.5 pl-3 ring-1 ring-foreground/10">
            <Link2 className="size-4 shrink-0 text-muted-foreground" />
            <input
              readOnly
              value={url}
              aria-label={texts.share.link}
              onFocus={(event) => event.target.select()}
              className="min-w-0 flex-1 bg-transparent text-sm outline-none"
            />
            <Button onClick={copy} className="h-9 shrink-0 px-3 font-semibold">
              {copied ? <Check /> : <Copy />} {copied ? texts.share.copied : texts.share.copy}
            </Button>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2">
            {canSend && (
              <Button variant="outline" onClick={send} className="h-10 font-semibold">
                <Send /> {texts.share.shareVia}
              </Button>
            )}
            <Button variant="ghost" onClick={() => stop().then((stopped) => stopped && onStopped())} disabled={working} className="ml-auto h-10 text-muted-foreground hover:text-destructive">
              {working ? <Loader2 className="animate-spin" /> : <Link2Off />} {texts.share.stop}
            </Button>
          </div>
        </div>
      ) : status === "error" ? (
        <div className="grid gap-3">
          <FieldAlert>{texts.share.error}</FieldAlert>
          <Button variant="outline" onClick={create} className="h-10 w-fit">
            {texts.share.retry}
          </Button>
        </div>
      ) : (
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" /> {texts.share.creating}
        </p>
      )}
    </>
  );
};

export default ShareLink;
