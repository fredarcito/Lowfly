// Whether this browser has seen the audio guide's first-time hint ("each step ends telling you where to go")
const KEY = "lowfly.audioGuideHintSeen";

export const audioGuideHintSeen = () => {
  try {
    return localStorage.getItem(KEY) === "1";
  } catch {
    return false;
  }
};

export const rememberAudioGuideHint = () => {
  try {
    localStorage.setItem(KEY, "1");
  } catch {
    // Private mode or blocked storage: the hint just shows again next time
  }
};
