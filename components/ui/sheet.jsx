"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Dialog as DialogPrimitive } from "radix-ui"

// Bottom sheet for mobile (a Radix Dialog anchored to the bottom of the screen)
function Sheet(props) {
  return <DialogPrimitive.Root data-slot="sheet" {...props} />
}

function SheetTrigger(props) {
  return <DialogPrimitive.Trigger data-slot="sheet-trigger" {...props} />
}

function SheetClose(props) {
  return <DialogPrimitive.Close data-slot="sheet-close" {...props} />
}

function SheetTitle({ className, ...props }) {
  return <DialogPrimitive.Title data-slot="sheet-title" className={cn("font-heading text-base font-semibold", className)} {...props} />
}

function SheetDescription({ className, ...props }) {
  return <DialogPrimitive.Description data-slot="sheet-description" className={cn("text-sm text-muted-foreground", className)} {...props} />
}

function SheetContent({ className, children, ...props }) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay
        data-slot="sheet-overlay"
        className="fixed inset-0 z-50 bg-black/50 duration-200 data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0"
      />
      <DialogPrimitive.Content
        data-slot="sheet-content"
        className={cn(
          "fixed inset-x-0 bottom-0 z-50 flex max-h-[90dvh] flex-col overflow-y-auto rounded-t-2xl bg-popover pb-[calc(1rem+env(safe-area-inset-bottom,0px))] text-sm text-popover-foreground shadow-xl ring-1 ring-foreground/10 outline-none duration-300 ease-[cubic-bezier(.2,.8,.2,1)] data-open:animate-in data-open:slide-in-from-bottom data-closed:animate-out data-closed:slide-out-to-bottom data-closed:duration-200 motion-reduce:animate-none",
          className
        )}
        {...props}
      >
        <div aria-hidden="true" className="mx-auto mt-2.5 h-1 w-10 shrink-0 rounded-full bg-muted-foreground/30" />
        {children}
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  )
}

export { Sheet, SheetTrigger, SheetClose, SheetContent, SheetTitle, SheetDescription }
