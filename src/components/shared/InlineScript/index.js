"use client";

import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

// An inline <script> (`code`) that only goes in the server's HTML, where the browser runs it as it reads the page.
// On a page the browser builds by itself (Next does that for a "not found" page) React would not run it, and it
// warns about it: there it is left out.
const InlineScript = ({ code, ...props }) => {
  // true while rendering on the server and hydrating its HTML; false when React builds the page by itself
  const fromServer = useSyncExternalStore(subscribe, () => false, () => true);
  return fromServer ? <script {...props} dangerouslySetInnerHTML={{ __html: code }} /> : null;
};

export default InlineScript;
