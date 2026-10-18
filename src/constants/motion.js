// How a page's content arrives, the same everywhere: titles stay put, the forms and the content rise into place
// (ENTER_RISE). ENTER_FADE is for what changes in place, like the trip planner's title between steps.
// Add a delay-* to stagger; fill-mode-backwards keeps it hidden meanwhile.
export const ENTER_FADE = "duration-500 animate-in fade-in motion-reduce:animate-none";
export const ENTER_RISE = "duration-500 ease-out animate-in fade-in slide-in-from-bottom-4 fill-mode-backwards motion-reduce:animate-none";

// Cards in a list rise one after another, this far apart (and no further than the sixth, so a long list does not wait)
export const riseDelay = (index, start = 0) => ({ animationDelay: `${start + Math.min(index, 5) * 60}ms` });
