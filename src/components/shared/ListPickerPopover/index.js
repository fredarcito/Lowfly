"use client";

import ResponsivePicker from "@/components/shared/ResponsivePicker";

// A field that opens a searchable list: the popover and sheet sizes shared by the airport and destination pickers
const ListPickerPopover = ({ open, onOpenChange, trigger, title, description, children }) => (
  <ResponsivePicker
    open={open}
    onOpenChange={onOpenChange}
    trigger={trigger}
    title={title}
    description={description}
    popoverClassName="flex max-h-[min(28rem,var(--radix-popover-content-available-height))] w-80 gap-0 p-0"
    sheetClassName="h-[85dvh] overflow-hidden"
  >
    {() => children}
  </ResponsivePicker>
);

export default ListPickerPopover;
