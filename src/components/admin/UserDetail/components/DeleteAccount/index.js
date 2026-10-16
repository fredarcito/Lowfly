"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, UserX } from "lucide-react";
import { Button } from "@/components/ui/button";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import { useAdmin } from "@/components/admin/hooks/useAdmin";
import { ROUTES } from "@/constants/routes";
import { deleteAccount } from "@/server/admin/actions";

// Deleting the account for good (after confirming), then back to the list. Not offered on the admin's own.
const DeleteAccount = ({ user, self }) => {
  const { lang, texts: all } = useAdmin();
  const texts = all.account;
  const router = useRouter();
  const [asking, setAsking] = useState(false);
  const [error, setError] = useState(null);
  const [deleting, startDeleting] = useTransition();
  const remove = () =>
    startDeleting(async () => {
      const result = await deleteAccount(user.id);
      if (result.error) setError(texts.errors[result.error] ?? texts.deleteError(result.error));
      else router.replace(ROUTES.adminUsers(lang));
    });

  return (
    <div className="grid gap-3">
      <p className="text-sm text-muted-foreground">{texts.deleteHint}</p>
      <Button variant="outline" onClick={() => setAsking(true)} disabled={self || deleting} className="h-10 w-fit px-4 text-destructive">
        {deleting ? <Loader2 className="animate-spin" /> : <UserX />}
        {texts.delete}
      </Button>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <ConfirmDialog
        open={asking}
        onOpenChange={setAsking}
        icon={UserX}
        title={texts.confirmTitle}
        description={texts.confirmText(user.email)}
        confirmLabel={texts.delete}
        onConfirm={remove}
        destructive
      />
    </div>
  );
};

export default DeleteAccount;
