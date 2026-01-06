"use client";

import React from "react";

const Button = ({
  children,
  variant = "primary",
  type,
  outline = false,
  className = "",
  style = {},
  icon = null,
  onClick = () => {},
  disabled = false,
  loading = false,
}: {
  children?: React.ReactNode;
  variant?: "primary" | "secondary";
  type?: "button" | "submit" | "reset";
  outline?: boolean;
  className?: string;
  style?: React.CSSProperties;
  icon?: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
}) => {
  const hasText = React.Children.count(children) > 0;
  const paddingClass = icon && !hasText ? "px-2" : "px-4";
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={[
        "py-2 rounded-full cursor-pointer flex items-center justify-center gap-2 transition-transform hover:scale-105 active:scale-95",
        paddingClass,
        variant === "secondary" && "bg-[#5a6260]",
        outline && "bg-transparent text-[#7f8b89] border border-[#7f8b89]",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      type={type}
      style={style}
    >
      {loading ? (
        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
      ) : (
        <>
          {icon && icon}
          {children}
        </>
      )}
    </button>
  );
};

export { Button };
