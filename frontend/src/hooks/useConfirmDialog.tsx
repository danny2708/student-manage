"use client";

import { useState, useCallback } from "react";

export function useConfirmDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [onConfirm, setOnConfirm] = useState<() => void>(() => () => {});

  const openConfirm = useCallback((msg: string, confirmAction: () => void) => {
    setMessage(msg);
    setOnConfirm(() => confirmAction);
    setIsOpen(true);
  }, []);

  const closeConfirm = useCallback(() => {
    setIsOpen(false);
  }, []);

  return {
    isOpen,
    message,
    onConfirm,
    openConfirm,
    closeConfirm,
  };
}
