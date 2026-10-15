"use client";

import { CircleAlert } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useI18n } from "@/context/i18n";
import { errorMessage } from "@/i18n";

// A search that could not be made: what went wrong (`code`: a key of texts.errors) and, when it may help, to retry
const SearchError = ({ code, params }) => {
  const { texts } = useI18n();
  return (
    <Alert variant="destructive">
      <CircleAlert />
      <AlertTitle>{texts.errors.title}</AlertTitle>
      <AlertDescription>
        {errorMessage(texts, code, params)}
        {params?.retry && ` ${texts.errors.retry}`}
      </AlertDescription>
    </Alert>
  );
};

export default SearchError;
