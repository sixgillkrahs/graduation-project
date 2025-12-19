import React from "react";

const Input = ({
  placeholder,
  className,
  preIcon,
  name,
}: {
  placeholder?: string;
  className?: string;
  preIcon?: React.ReactNode;
  name?: string;
}) => {
  return (
    <div
      className={`flex items-center border border-black/10 rounded-full px-4 py-2 ${className}`}
    >
      {preIcon && <div className="mr-2">{preIcon}</div>}
      <input
        type="text"
        placeholder={placeholder}
        className="w-full outline-none"
        name={name}
      />
    </div>
  );
};

export { Input };
