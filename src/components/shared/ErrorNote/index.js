"use client";

import { CircleAlert } from "lucide-react";
import { useI18n } from "@/context/i18n";
import { errorMessage } from "@/i18n";

// An error from our API in a small red box: what went wrong (error: { code, params, retry }) and, when it may
// help, to try again
const ErrorNote = ({ error }) => {
  const { texts } = useI18n();
  return (
    <p role="alert" className="flex gap-2 rounded-lg bg-destructive/10 px-3 py-2.5 text-sm text-destructive">
      <CircleAlert className="mt-0.5 size-4 shrink-0" />
      <span>
        {errorMessage(texts, error.code, error.params)}
        {error.retry && ` ${texts.errors.retry}`}
      </span>
    </p>
  );
};

export default ErrorNote;
