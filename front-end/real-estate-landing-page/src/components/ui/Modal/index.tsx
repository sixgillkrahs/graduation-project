"use client";

import React, { useEffect } from "react";
import ReactDOM from "react-dom";
import { useModal } from "./useModal";
import styles from "./index.module.css";
import { Icon } from "../Icon";

export type ModalProps = {
  open: boolean;
  onCancel: () => void;
  title?: React.ReactNode;
  children: React.ReactNode;
  maskClosable?: boolean;
};

const Modal = ({
  open,
  onCancel,
  title,
  children,
  maskClosable = true,
}: ModalProps) => {
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onCancel]);

  useEffect(() => {
    if (!open) return;

    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = original;
    };
  }, [open]);

  if (!open) return null;
  return ReactDOM.createPortal(
    <>
      <div
        className={styles["antd-modal-mask"]}
        onClick={maskClosable ? onCancel : undefined}
      />

      <div
        className={styles["antd-modal-wrap"]}
        role="dialog"
        aria-modal="true"
      >
        <div className={styles["antd-modal"]}>
          <div className={styles["antd-modal-header"]}>
            <div className={styles["antd-modal-title"]}>{title}</div>
            <button
              className={styles["antd-modal-close"]}
              aria-label="Close"
              onClick={onCancel}
            >
              <Icon.Close />
            </button>
          </div>

          <div className={styles["antd-modal-body"]}>{children}</div>
        </div>
      </div>
    </>,
    document.body
  );
};

export { Modal };
export { useModal };
