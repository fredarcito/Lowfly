"use client";

import { Share2 } from "lucide-react";
import DialogHeading from "@/components/shared/DialogHeading";
import ShareLinkBox from "@/components/shared/ShareLinkBox";
import { useShareLink } from "@/hooks/useShareLink";

// The share dialog's content for a page anyone may open: what is shared, and its link to copy or send
const ShareLinkDialog = ({ title, description, path, message, analytics }) => {
  const { url, copied, canSend, copy, send } = useShareLink({ path, message, analytics });
  return (
    <>
      <DialogHeading icon={Share2} title={title} description={description} />
      <ShareLinkBox url={url} copied={copied} onCopy={copy} canSend={canSend} onSend={send} />
    </>
  );
};

export default ShareLinkDialog;
