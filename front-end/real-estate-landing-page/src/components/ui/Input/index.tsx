import React from "react";

const Input = ({
  placeholder,
  className,
  preIcon,
  name,
  label,
  error,
  onChange,
  value,
  register,
  ...rest
}: {
  placeholder?: string;
  className?: string;
  preIcon?: React.ReactNode;
  name?: string;
  label?: string;
  error?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  value?: string;
  register?: any;
} & React.InputHTMLAttributes<HTMLInputElement>) => {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="cs-paragraph text-sm! font-medium!">{label}</label>
      )}
      <div
        className={`flex items-center justify-between w-full
            border border-black/10 rounded-full px-4 py-2
            bg-white outline-none transition-all ${className}  ${
          error ? "border-red-500" : ""
        }`}
      >
        {preIcon && <div className="mr-2">{preIcon}</div>}
        <input
          type="text"
          placeholder={placeholder}
          className="w-full outline-none"
          name={name}
          onChange={onChange}
          value={value}
          {...rest}
        />
      </div>
      {error && <p className="text-red-500 text-sm! font-medium!">{error}</p>}
    </div>
  );
};

export { Input };
