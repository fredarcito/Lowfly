"use client";

import { useState } from "react";

// How long a card takes to fold away before it is removed (a town of the planning form, a saved trip)
const LEAVE_MS = 300;

// Removing with a goodbye: `leaving` while it folds away (the card animates out), then `onDone()`
export const useLeaving = (onDone) => {
  const [leaving, setLeaving] = useState(false);
  const leave = () => {
    setLeaving(true);
    setTimeout(onDone, LEAVE_MS);
  };
  return { leaving, leave };
};
