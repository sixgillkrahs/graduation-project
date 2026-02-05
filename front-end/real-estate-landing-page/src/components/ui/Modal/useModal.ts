"use client";

import { useCallback, useState } from "react";

export function useModal() {
  const [open, setOpen] = useState(false);

  const show = useCallback(() => setOpen(true), []);
  const hide = useCallback(() => setOpen(false), []);

  return {
    open,
    show,
    hide,
  };
}
