"use client";

import { XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useI18n } from "@/context/i18n";
import { useDesktop } from "@/hooks/useDesktop";

// A field's picker: a popover under the field on desktop, a bottom sheet with a title and a close button on
// phones. `children(desktop)` renders the picker, so it can differ between both (two months or one).
// `description` is read by screen readers only.
const ResponsivePicker = ({ open, onOpenChange, trigger, title, description, popoverClassName, sheetClassName, children }) => {
  const { texts } = useI18n();
  const desktop = useDesktop();

  if (desktop) {
    return (
      <Popover open={open} onOpenChange={onOpenChange}>
        <PopoverTrigger asChild>{trigger}</PopoverTrigger>
        <PopoverContent align="start" className={popoverClassName}>
          {children(true)}
        </PopoverContent>
      </Popover>
    );
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetTrigger asChild>{trigger}</SheetTrigger>
      <SheetContent className={sheetClassName}>
        <div className="flex items-center justify-between gap-3 px-4 pt-3">
          <SheetTitle>{title}</SheetTitle>
          <SheetClose asChild>
            <Button variant="ghost" size="icon" className="-mr-2 size-9" aria-label={texts.picker.close}>
              <XIcon />
            </Button>
          </SheetClose>
        </div>
        <SheetDescription className="sr-only">{description}</SheetDescription>
        {children(false)}
      </SheetContent>
    </Sheet>
  );
};

export default ResponsivePicker;
