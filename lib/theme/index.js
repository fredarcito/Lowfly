// Colour theme: dark by default, light if the visitor chose it (remembered on this device)
export const THEMES = ["dark", "light"];
export const DEFAULT_THEME = "dark";
export const THEME_KEY = "lowfly.theme";

// Runs in <head> before the page is painted, so a saved light theme never flashes dark
export const themeScript = `try{var t=localStorage.getItem("${THEME_KEY}");if(t==="light"||t==="dark")document.documentElement.dataset.theme=t}catch(e){}`;
