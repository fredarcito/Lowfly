"use client";

import { Link2Off, Loader2, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import FieldAlert from "@/components/shared/FieldAlert";
import ShareLinkBox from "@/components/shared/ShareLinkBox";
import { useI18n } from "@/context/i18n";
import { useTripShare } from "@/components/trips/sharing/ShareTripDialog/components/ShareLink/hooks/useTripShare";
import DialogHeading from "@/components/shared/DialogHeading";

// The link, created when the dialog opens: copy it, send it (phones' share sheet) or turn it off (`onStopped`)
const ShareLink = ({ trip, onStopped }) => {
  const { texts } = useI18n();
  const { status, url, copied, canSend, create, stop, copy, send } = useTripShare(trip);
  const working = status === "working";

  return (
    <>
      <DialogHeading icon={Share2} title={texts.share.title} description={texts.share.text} />

      {url ? (
        <ShareLinkBox url={url} copied={copied} onCopy={copy} canSend={canSend} onSend={send}>
          <Button variant="ghost" onClick={() => stop().then((stopped) => stopped && onStopped())} disabled={working} className="ml-auto h-10 text-muted-foreground hover:text-destructive">
            {working ? <Loader2 className="animate-spin" /> : <Link2Off />} {texts.share.stop}
          </Button>
        </ShareLinkBox>
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
