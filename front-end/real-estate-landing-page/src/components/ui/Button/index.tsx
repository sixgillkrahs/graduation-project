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
}: {
  children?: React.ReactNode;
  variant?: "primary" | "secondary";
  type?: "button" | "submit" | "reset";
  outline?: boolean;
  className?: string;
  style?: React.CSSProperties;
  icon?: React.ReactNode;
  onClick?: () => void;
}) => {
  const hasText = React.Children.count(children) > 0;
  const paddingClass = icon && !hasText ? "px-2" : "px-4";
  return (
    <button
      onClick={onClick}
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
      {icon && icon}
      {children}
    </button>
  );
};

export { Button };
