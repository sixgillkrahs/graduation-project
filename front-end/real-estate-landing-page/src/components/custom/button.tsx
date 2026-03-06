"use client";

import {
  RippleButton,
  RippleButtonProps,
  RippleButtonRipples,
} from "@/components/animate-ui/components/buttons/ripple";
import { cn } from "@/lib/utils";
import React from "react";

type CsButtonProps = React.ComponentProps<"button"> & {
  loading?: boolean;
  icon?: React.ReactNode;
  variant?: RippleButtonProps["variant"];
  size?: RippleButtonProps["size"];
};

const CsButton = ({
  children,
  variant = "default",
  type,
  className = "",
  style = {},
  icon = null,
  onClick,
  disabled = false,
  loading = false,
  size = "default",
  form,
}: CsButtonProps) => {
  return (
    <RippleButton
      className={cn(
        "cursor-pointer rounded-xl transition-all",
        variant === "default" && "cs-bg-black text-white hover:opacity-90",
        size === "default" && "h-[42px]",
        className,
      )}
      onClick={onClick}
      disabled={disabled || loading}
      type={type}
      style={style}
      variant={variant}
      size={size}
      form={form}
    >
      {loading && (
        <svg
          className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      )}
      {!loading && icon && (
        <span className="mr-2 flex items-center">{icon}</span>
      )}
      {children}
      <RippleButtonRipples />
    </RippleButton>
  );
};

export { CsButton };
