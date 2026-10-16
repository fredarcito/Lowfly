"use client";

import { useState, useTransition } from "react";
import { Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAdmin } from "@/components/admin/hooks/useAdmin";
import { setOwnLimit } from "@/server/admin/actions";

// The account's daily itinerary limit: the app-wide one, or its own number
const LimitForm = ({ userId, ownLimit, globalLimit }) => {
  const texts = useAdmin().texts.limit;
  const [own, setOwn] = useState(ownLimit !== null);
  const [value, setValue] = useState(String(ownLimit ?? globalLimit));
  const [status, setStatus] = useState(null);
  const [saving, startSaving] = useTransition();
  const choose = (wantsOwn) => {
    setOwn(wantsOwn);
    setStatus(null);
  };
  const save = (event) => {
    event.preventDefault();
    startSaving(async () => {
      const result = await setOwnLimit(userId, own ? Number(value) : null);
      setStatus(result.error ? { error: result.error } : { saved: true });
    });
  };

  return (
    <form onSubmit={save} className="grid gap-3">
      <label className="flex items-center gap-2.5 text-sm">
        <input type="radio" name="limit" checked={!own} onChange={() => choose(false)} className="size-4 accent-primary" />
        {texts.global(globalLimit)}
      </label>
      <label className="flex items-center gap-2.5 text-sm">
        <input type="radio" name="limit" checked={own} onChange={() => choose(true)} className="size-4 accent-primary" />
        {texts.own}
      </label>
      {own && (
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
          className="h-11 text-base md:text-sm"
        />
      )}
      <Button type="submit" disabled={saving} className="h-10 w-fit px-5 font-bold">
        {saving ? <Loader2 className="animate-spin" /> : status?.saved ? <Check /> : null}
        {status?.saved && !saving ? texts.saved : texts.save}
      </Button>
      {status?.error && <p className="text-sm text-destructive">{texts.saveError(status.error)}</p>}
    </form>
  );
};

export default LimitForm;
