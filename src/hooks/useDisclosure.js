"use client";

import { useCallback, useState } from "react";

// Open / closed state for dialogs, menus and collapsible sections
export function useDisclosure(initial = false) {
  const [open, setOpen] = useState(initial);
  const show = useCallback(() => setOpen(true), []);
  const hide = useCallback(() => setOpen(false), []);
  const toggle = useCallback(() => setOpen((current) => !current), []);
  return { open, setOpen, show, hide, toggle };
}
