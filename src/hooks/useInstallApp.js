"use client";

import { useSyncExternalStore } from "react";

// Chrome and Edge on Android offer their own "install" prompt once per page load, often before anything is on screen:
// it is kept here (and the browser's own bar held back) so a button of ours can open it later
let installPrompt = null;
const listeners = new Set();
const notify = () => listeners.forEach((listener) => listener());

if (typeof window !== "undefined") {
  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    installPrompt = event;
    notify();
  });
  window.addEventListener("appinstalled", () => {
    installPrompt = null;
    notify();
  });
}

const subscribe = (onChange) => {
  listeners.add(onChange);
  return () => listeners.delete(onChange);
};

// iPad on iOS 13+ says it is a Mac: told apart by its touch screen
const isAppleMobile = () =>
  /iPhone|iPad|iPod/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

// How this browser installs Lowfly: "prompt" (the browser's own dialog), "steps" (iPhone and iPad have no dialog:
// the visitor does it from the Share menu) or null (already installed, or a browser that cannot)
const getWay = () => {
  const installed = window.matchMedia("(display-mode: standalone)").matches || navigator.standalone === true;
  if (installed) return null;
  if (installPrompt) return "prompt";
  return isAppleMobile() ? "steps" : null;
};

// Installing Lowfly on the home screen: how this browser does it (`way`) and opening the browser's dialog (`install`,
// only for "prompt"). The prompt works once: after it, `way` goes back to null until the browser offers it again.
export const useInstallApp = () => {
  const way = useSyncExternalStore(subscribe, getWay, () => null);

  const install = async () => {
    const prompt = installPrompt;
    if (!prompt) return;
    installPrompt = null;
    notify();
    await prompt.prompt();
  };

  return { way, install };
};
