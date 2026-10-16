"use client";

import { useState, useTransition } from "react";
import { Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import FormField from "@/components/shared/FormField";
import { useAdmin } from "@/components/admin/hooks/useAdmin";
import { updateAccount } from "@/server/admin/actions";

// The account's details the admin can change: name, email (not for Google accounts: Google keeps it), admin,
// blocked. On their own account (`self`) the admin cannot block it or give up the admin.
const AccountForm = ({ user, self }) => {
  const texts = useAdmin().texts.account;
  const [fields, setFields] = useState({ name: user.name ?? "", email: user.email ?? "", admin: user.admin, blocked: user.blocked });
  const [status, setStatus] = useState(null);
  const [saving, startSaving] = useTransition();
  const change = (changes) => {
    setFields((current) => ({ ...current, ...changes }));
    setStatus(null);
  };
  const save = (event) => {
    event.preventDefault();
    startSaving(async () => {
      const result = await updateAccount(user.id, fields);
      setStatus(result.error ? { error: texts.errors[result.error] ?? texts.saveError(result.error) } : { saved: true });
    });
  };

  return (
    <form onSubmit={save} className="grid gap-4">
      <FormField id="account-name" label={texts.name} hint={user.google ? texts.googleName : undefined}>
        <Input id="account-name" value={fields.name} maxLength={100} onChange={(event) => change({ name: event.target.value })} className="h-11 text-base md:text-sm" />
      </FormField>
      <FormField id="account-email" label={texts.email} hint={user.google ? texts.googleEmail : undefined}>
        <Input
          id="account-email"
          type="email"
          required
          disabled={user.google}
          value={fields.email}
          onChange={(event) => change({ email: event.target.value })}
          className="h-11 text-base md:text-sm"
        />
      </FormField>
      <label className="flex gap-2.5 text-sm">
        <input type="checkbox" checked={fields.admin} disabled={self} onChange={(event) => change({ admin: event.target.checked })} className="mt-0.5 size-4 accent-primary" />
        <span className="grid gap-0.5">
          <span className="font-medium">{texts.admin}</span>
          <span className="text-muted-foreground">{texts.adminHint}</span>
        </span>
      </label>
      <label className="flex gap-2.5 text-sm">
        <input type="checkbox" checked={fields.blocked} disabled={self} onChange={(event) => change({ blocked: event.target.checked })} className="mt-0.5 size-4 accent-primary" />
        <span className="grid gap-0.5">
          <span className="font-medium">{texts.blocked}</span>
          <span className="text-muted-foreground">{texts.blockedHint}</span>
        </span>
      </label>
      {self && <p className="text-xs text-muted-foreground">{texts.self}</p>}
      <Button type="submit" disabled={saving} className="h-10 w-fit px-5 font-bold">
        {saving ? <Loader2 className="animate-spin" /> : status?.saved ? <Check /> : null}
        {status?.saved && !saving ? texts.saved : texts.save}
      </Button>
      {status?.error && <p className="text-sm text-destructive">{status.error}</p>}
    </form>
  );
};

export default AccountForm;
