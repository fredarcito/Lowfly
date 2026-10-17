"use client";

import { useLayoutEffect } from "react";
import InlineScript from "@/components/shared/InlineScript";
import { applySavedTheme, themeScript } from "@/utils/theme";

// Puts the saved theme on <html> before the page is painted (utils/theme): with the server's HTML, its inline
// script; on a page the browser builds by itself (a "not found" one), as soon as React has it, still before paint.
const ThemeScript = () => {
  useLayoutEffect(() => {
    applySavedTheme();
  }, []);

  return <InlineScript code={themeScript} />;
};

export default ThemeScript;
