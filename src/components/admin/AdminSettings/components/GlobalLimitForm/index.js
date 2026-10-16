"use client";

import { useState, useTransition } from "react";
import { Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAdmin } from "@/components/admin/hooks/useAdmin";
import { setGlobalLimit } from "@/server/admin/actions";

// The app-wide daily itinerary limit: a number and Save
const GlobalLimitForm = ({ globalLimit }) => {
  const texts = useAdmin().texts.limit;
  const [value, setValue] = useState(String(globalLimit));
  const [status, setStatus] = useState(null);
  const [saving, startSaving] = useTransition();
  const save = (event) => {
    event.preventDefault();
    startSaving(async () => {
      const result = await setGlobalLimit(Number(value));
      setStatus(result.error ? { error: result.error } : { saved: true });
    });
  };
  return (
    <form onSubmit={save} className="grid gap-3">
      <div className="flex gap-2">
        <Input
          type="number"
          min={0}
          max={100}
          step={1}
          required
          value={value}
          onChange={(event) => {
            setValue(event.target.value);
            setStatus(null);
          }}
          aria-label={texts.perDay}
          className="h-11 w-28 text-base md:text-sm"
        />
        <Button type="submit" disabled={saving} className="h-11 px-5 font-bold">
          {saving ? <Loader2 className="animate-spin" /> : status?.saved ? <Check /> : null}
          {status?.saved && !saving ? texts.saved : texts.save}
        </Button>
      </div>
      {status?.error && <p className="text-sm text-destructive">{texts.saveError(status.error)}</p>}
    </form>
  );
};

export default GlobalLimitForm;
