"use client";

import { Share, Smartphone } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import DialogHeading from "@/components/shared/DialogHeading";
import { useI18n } from "@/context/i18n";

// iPhone and iPad have no install dialog: the steps to add Lowfly to the home screen from Safari's Share menu
const InstallSteps = ({ open, onOpenChange }) => {
  const { texts } = useI18n();
  const words = texts.install.steps;
  const steps = [
    <>
      {words.share} <Share className="inline size-4 -translate-y-0.5 text-primary-ink" aria-hidden />
      <span className="mt-0.5 block text-sm text-muted-foreground">{words.shareHint}</span>
    </>,
    words.add,
    words.done,
  ];
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent closeLabel={texts.picker.close} className="gap-6">
        <DialogHeading icon={Smartphone} title={words.title} description={words.description} />
        <ol className="grid gap-4 rounded-xl bg-muted/50 p-4">
          {steps.map((step, index) => (
            <li key={index} className="flex gap-3 leading-snug">
              <span className="grid size-6 shrink-0 place-items-center rounded-full bg-primary/10 text-xs font-bold text-primary-ink">
                {index + 1}
              </span>
              <span className="pt-0.5">{step}</span>
            </li>
          ))}
        </ol>
      </DialogContent>
    </Dialog>
  );
};

export default InstallSteps;
