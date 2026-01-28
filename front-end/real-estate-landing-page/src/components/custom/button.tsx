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
        "cs-bg-black text-white cursor-pointer rounded-xl h-[42px]",
        className,
      )}
      onClick={onClick}
      disabled={disabled}
      type={type}
      style={style}
      variant={variant}
      size={size}
      form={form}
    >
      {loading ? (
        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
      ) : (
        <>
          {icon && icon}
          {children}
        </>
      )}
      <RippleButtonRipples />
    </RippleButton>
  );
};

export { CsButton };
