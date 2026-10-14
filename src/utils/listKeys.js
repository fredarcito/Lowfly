// Keyboard for a search box with a list of options under it (airport, destination and town pickers):
// the arrows move through the options, Enter picks the active one and Escape closes the list.
// count: how many options; active: the index of the highlighted one; canPick: whether Enter may pick now.
// Returns the input's onKeyDown.
const STEPS = { ArrowDown: 1, ArrowUp: -1 };

export const listKeyDown =
  ({ count, active, setActive, onPick, onMove, onClose, canPick = true }) =>
  (event) => {
    const step = STEPS[event.key];
    const actions = {
      Enter: canPick && active < count ? () => onPick(active) : null,
      Escape: onClose,
    };
    if (step) {
      event.preventDefault();
      onMove?.();
      setActive((index) => Math.min(count - 1, Math.max(0, index + step)));
    } else if (actions[event.key]) {
      event.preventDefault();
      actions[event.key]();
    }
  };
