import { THEME_KEY } from "@/constants/theme";

// Runs before the page is painted, so a saved light theme never flashes dark
export const themeScript = `try{var saved=localStorage.getItem("${THEME_KEY}");if(saved==="light"||saved==="dark")document.documentElement.dataset.theme=saved}catch(error){}`;

// The same, from React: for a page the browser builds by itself, where no script from the server ran
export const applySavedTheme = () => {
  try {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved === "light" || saved === "dark") document.documentElement.dataset.theme = saved;
  } catch {}
};
