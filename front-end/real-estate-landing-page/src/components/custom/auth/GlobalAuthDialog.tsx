"use client";

import { hideAuthDialog } from "@/store/auth-dialog.store";
import { AuthActionDialog } from "./AuthActionDialog";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";

export function GlobalAuthDialog() {
  const dispatch = useAppDispatch();
  const { isOpen, title, description, redirectUrl } = useAppSelector(
    (state) => state.authDialog,
  );

  return (
    <AuthActionDialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) dispatch(hideAuthDialog());
      }}
      title={title}
      description={description}
      redirectUrl={redirectUrl}
    />
  );
}
