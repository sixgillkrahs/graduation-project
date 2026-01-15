"use client";

import { cn } from "@/lib/utils";
import { ChangeEvent, InputHTMLAttributes, ReactNode, useState } from "react";
import { Icon } from "../Icon";
import { Field, FieldError, FieldLabel } from "../field";
import OTP from "./OTP";

// const Input = ({
//   placeholder,
//   className,
//   preIcon,
//   name,
//   label,
//   error,
//   onChange,
//   value,
//   register,
//   suffix,
//   ...rest
// }: {
//   placeholder?: string;
//   className?: string;
//   preIcon?: ReactNode;
//   name?: string;
//   label?: string;
//   error?: string;
//   onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
//   value?: string;
//   register?: any;
//   suffix?: ReactNode;
// } & InputHTMLAttributes<HTMLInputElement>) => {
//   return (
//     <div className="flex flex-col gap-1">
//       {label && (
//         <label className="cs-paragraph text-sm! font-medium!">{label}</label>
//       )}
//       <div
//         className={`flex items-center justify-between w-full
//             border border-black/10 rounded-full px-4 py-2
//             bg-white outline-none transition-all ${className}  ${
//           error ? "border-red-500" : ""
//         }`}
//       >
//         {preIcon && <div className="mr-2">{preIcon}</div>}
//         <input
//           type="text"
//           placeholder={placeholder}
//           className="w-full outline-none"
//           name={name}
//           onChange={onChange}
//           value={value}
//           {...rest}
//         />
//         {suffix && <div className="ml-2">{suffix}</div>}
//       </div>
//       {error && <p className="text-red-500 text-sm! font-medium!">{error}</p>}
//     </div>
//   );
// };

const Password = ({
  placeholder,
  className,
  preIcon,
  name,
  label,
  error,
  onChange,
  value,
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
      label={label || ""}
      error={error}
      onChange={onChange}
      value={value}
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
function InputRadix({
  className,
  type,
  preIcon,
  suffix,
  ...props
}: React.ComponentProps<"input"> & {
  preIcon?: ReactNode;
  suffix?: ReactNode;
}) {
  return (
    <div className="relative w-full">
      {preIcon ? (
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none flex items-center">
          {preIcon}
        </span>
      ) : null}

      {suffix ? (
        <button
          type="button"
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground flex items-center"
          tabIndex={-1}
        >
          {suffix}
        </button>
      ) : null}

      <input
        type={type}
        data-slot="input"
        className={cn(
          "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
          "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
          preIcon && "pl-10",
          suffix && "pr-10",
          className
        )}
        {...props}
      />
    </div>
  );
}

function Input({
  className,
  type,
  preIcon,
  suffix,
  label,
  error,
  ...props
}: React.ComponentProps<"input"> & {
  label: string;
  preIcon?: ReactNode;
  suffix?: ReactNode;
  error?: string;
}) {
  return (
    <div className="grid w-full items-center gap-3">
      <Field>
        <FieldLabel htmlFor={props.id}>{label}</FieldLabel>
        <InputRadix
          id={props.id}
          className={className}
          type={type}
          {...props}
          suffix={suffix}
          preIcon={preIcon}
        />
        {error && (
          <FieldError
            errors={[
              {
                message: error,
              },
            ]}
          />
        )}
      </Field>
    </div>
  );
}

export { Input, OTP, Password };
