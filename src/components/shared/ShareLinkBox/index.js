"use client";

import { Check, Copy, Link2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/context/i18n";

// A share dialog's link: in sight to copy by hand, "Copy" ("Copied" for a moment) and, where the device has a
// share sheet, "Send…". `children`: more actions beside "Send…" (a trip's "Stop sharing").
const ShareLinkBox = ({ url, copied, onCopy, canSend, onSend, children }) => {
  const { texts } = useI18n();
  return (
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
        <Button onClick={onCopy} className="h-9 shrink-0 px-3 font-semibold">
          {copied ? <Check /> : <Copy />} {copied ? texts.share.copied : texts.share.copy}
        </Button>
      </div>
      {(canSend || children) && (
        <div className="flex flex-wrap items-center justify-between gap-2">
          {canSend && (
            <Button variant="outline" onClick={onSend} className="h-10 font-semibold">
              <Send /> {texts.share.shareVia}
            </Button>
          )}
          {children}
        </div>
      )}
    </div>
  );
};

export default ShareLinkBox;
