"use client";

import { DialogDescription, DialogTitle } from "@/components/ui/dialog";

const DialogHeading = ({ icon: Icon, title, description }) => {
  return (
    <div className="flex gap-4 pr-6">
      <span className="grid size-11 shrink-0 place-items-center rounded-full bg-primary/10 text-primary-ink">
        <Icon className="size-5" />
      </span>
      <div className="grid gap-1.5">
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription>{description}</DialogDescription>
      </div>
    </div>
  );
};

export default DialogHeading;
