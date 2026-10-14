// The departure airport the visitor picked, remembered on this device
const KEY = "lowfly.origin";

export function savedOrigin() {
  try {
    return localStorage.getItem(KEY) || "";
  } catch {
    return ""; // private mode or blocked storage
  }
}

export function saveOrigin(code) {
  try {
    localStorage.setItem(KEY, code);
  } catch {}
}
