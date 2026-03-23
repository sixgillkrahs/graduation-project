"use client";

import type { ReactNode } from "react";
import { sileo, type SileoOptions, type SileoPosition } from "sileo";

type ToastMessage = ReactNode | string;
export type ToastOptions = Omit<SileoOptions, "title" | "type">;

const normalizeToastOptions = (
  message: ToastMessage,
  options?: ToastOptions,
): SileoOptions => {
  if (typeof message === "string") {
    return {
      title: message,
      ...options,
    };
  }

  return {
    description: message,
    ...options,
  };
};

const createToastHandler =
  (type: "success" | "error" | "info" | "warning") =>
  (message: ToastMessage, options?: ToastOptions) =>
    sileo[type](normalizeToastOptions(message, options));

type ToastPromiseMessages<T> = {
  loading: ToastMessage;
  success: ToastMessage | ((data: T) => ToastMessage);
  error: ToastMessage | ((error: unknown) => ToastMessage);
};

const resolvePromiseMessage = <T,>(
  message: ToastMessage | ((value: T) => ToastMessage),
  value: T,
) => (typeof message === "function" ? message(value) : message);

type ToastFn = ((message: ToastMessage, options?: ToastOptions) => string) & {
  success: (message: ToastMessage, options?: ToastOptions) => string;
  error: (message: ToastMessage, options?: ToastOptions) => string;
  info: (message: ToastMessage, options?: ToastOptions) => string;
  warning: (message: ToastMessage, options?: ToastOptions) => string;
  loading: (message: ToastMessage, options?: ToastOptions) => string;
  promise: <T>(
    promise: Promise<T> | (() => Promise<T>),
    messages: ToastPromiseMessages<T>,
    options?: ToastOptions,
  ) => Promise<T>;
  dismiss: (id: string) => void;
  clear: (position?: SileoPosition) => void;
};

export const toast: ToastFn = Object.assign(
  (message: ToastMessage, options?: ToastOptions) =>
    sileo.show(normalizeToastOptions(message, options)),
  {
    success: createToastHandler("success"),
    error: createToastHandler("error"),
    info: createToastHandler("info"),
    warning: createToastHandler("warning"),
    loading: (message: ToastMessage, options?: ToastOptions) =>
      sileo.show({
        ...normalizeToastOptions(message, options),
        type: "loading",
      }),
    promise: <T,>(
      promise: Promise<T> | (() => Promise<T>),
      messages: ToastPromiseMessages<T>,
      options?: ToastOptions,
    ) =>
      sileo.promise(promise, {
        loading: normalizeToastOptions(messages.loading, options),
        success: (data) =>
          normalizeToastOptions(
            resolvePromiseMessage(messages.success, data),
            options,
          ),
        error: (error) =>
          normalizeToastOptions(
            resolvePromiseMessage(messages.error, error),
            options,
          ),
        position: options?.position,
      }),
    dismiss: sileo.dismiss,
    clear: sileo.clear,
  },
);
