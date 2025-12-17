import React from "react";

const Button = ({
  children,
  variant = "primary",
  type,
  outline = false,
  className = "",
  style = {},
}: {
  children: React.ReactNode;
  variant?: "primary" | "secondary";
  type?: "button" | "submit" | "reset";
  outline?: boolean;
  className?: string;
  style?: React.CSSProperties;
}) => {
  return (
    <button
      className={`px-4 py-2 rounded-[8px] cursor-pointer hover:scale-105 active:scale-95 ${
        variant === "secondary" ? "bg-[#5a6260]" : ""
      } ${
        outline ? "bg-transparent text-[#7f8b89] border border-[#7f8b89]" : ""
      } ${className || ""}`}
      type={type}
      style={style}
    >
      {children}
    </button>
  );
};

export default Button;
