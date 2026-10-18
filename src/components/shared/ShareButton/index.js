"use client";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import ShareTrigger from "@/components/shared/ShareTrigger";
import ShareLinkDialog from "@/components/shared/ShareButton/components/ShareLinkDialog";
import { useI18n } from "@/context/i18n";
import { useDisclosure } from "@/hooks/useDisclosure";

// "Share" for a page anyone may open (a city guide), the same as a trip's: the glass button, then the dialog with
// the link to copy or send. No account and no link to create: the page's own address is the link.
// `title`, `description`: the dialog's; `path`, `message`, `analytics`: hooks/useShareLink; `compact`: only the
// icon on phones.
const ShareButton = ({ title, description, path, message, analytics, compact = false, className }) => {
  const { texts } = useI18n();
  const dialog = useDisclosure();
  return (
    <>
      <ShareTrigger onClick={dialog.show} compact={compact} className={className} />
      <Dialog open={dialog.open} onOpenChange={dialog.setOpen}>
        <DialogContent closeLabel={texts.picker.close}>
          <ShareLinkDialog title={title} description={description} path={path} message={message} analytics={analytics} />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ShareButton;
