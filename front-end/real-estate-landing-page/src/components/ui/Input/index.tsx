"use client";

import { ChangeEvent, InputHTMLAttributes, ReactNode, useState } from "react";
import { Icon } from "../Icon";

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
  suffix,
  ...rest
}: {
  placeholder?: string;
  className?: string;
  preIcon?: ReactNode;
  name?: string;
  label?: string;
  error?: string;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
  value?: string;
  register?: any;
  suffix?: ReactNode;
} & InputHTMLAttributes<HTMLInputElement>) => {
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
        {suffix && <div className="ml-2">{suffix}</div>}
      </div>
      {error && <p className="text-red-500 text-sm! font-medium!">{error}</p>}
    </div>
  );
};

const Password = ({
  placeholder,
  className,
  preIcon,
  name,
  label,
  error,
  onChange,
  value,
  register,
  suffix,
  ...rest
}: {
  placeholder?: string;
  className?: string;
  preIcon?: ReactNode;
  name?: string;
  label?: string;
  error?: string;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
  value?: string;
  register?: any;
  suffix?: ReactNode;
} & InputHTMLAttributes<HTMLInputElement>) => {
  const [showPassword, setShowPassword] = useState(false);

  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Input
      placeholder={placeholder}
      className={className}
      preIcon={preIcon}
      name={name}
      label={label}
      error={error}
      onChange={onChange}
      value={value}
      register={register}
      type={showPassword ? "text" : "password"}
      suffix={
        showPassword ? (
          <Icon.Eye
            className="main-color-gray w-5 h-5 cursor-pointer"
            onClick={handleTogglePassword}
          />
        ) : (
          <Icon.EyeClose
            className="main-color-gray w-5 h-5 cursor-pointer"
            onClick={handleTogglePassword}
          />
        )
      }
      {...rest}
    />
  );
};

export { Input, Password };
