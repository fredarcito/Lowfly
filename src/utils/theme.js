import { THEME_KEY } from "@/constants/theme";

// Runs in <head> before the page is painted, so a saved light theme never flashes dark
export const themeScript = `try{var saved=localStorage.getItem("${THEME_KEY}");if(saved==="light"||saved==="dark")document.documentElement.dataset.theme=saved}catch(error){}`;
