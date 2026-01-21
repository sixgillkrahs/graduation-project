"use client";

import { cn } from "@/lib/utils";
import { ChangeEvent, InputHTMLAttributes, ReactNode, useState } from "react";
import { Icon } from "../Icon";
import { Field, FieldError, FieldLabel } from "../field";
import OTP from "./OTP";

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
    // <Input
    //   placeholder={placeholder}
    //   className={className}
    //   preIcon={preIcon}
    //   name={name}
    //   label={label || ""}
    //   error={error}
    //   onChange={onChange}
    //   value={value}
    //   type={showPassword ? "text" : "password"}
    //   suffix={
    //     showPassword ? (
    //       <Icon.Eye
    //         className="main-color-gray w-5 h-5 cursor-pointer"
    //         onClick={handleTogglePassword}
    //       />
    //     ) : (
    //       <Icon.EyeClose
    //         className="main-color-gray w-5 h-5 cursor-pointer"
    //         onClick={handleTogglePassword}
    //       />
    //     )
    //   }
    //   {...rest}
    // />
    <></>
  );
};

// function Input({
//   className,
//   type,
//   preIcon,
//   suffix,
//   label,
//   error,
//   ...props
// }: React.ComponentProps<"input"> & {
//   label: string;
//   preIcon?: ReactNode;
//   suffix?: ReactNode;
//   error?: string;
// }) {
//   return (
//     <div className="grid w-full items-center gap-3">
//       <Field>
//         <FieldLabel htmlFor={props.id}>{label}</FieldLabel>
//         <InputRadix
//           id={props.id}
//           className={className}
//           type={type}
//           {...props}
//           suffix={suffix}
//           preIcon={preIcon}
//         />
//         {error && (
//           <FieldError
//             errors={[
//               {
//                 message: error,
//               },
//             ]}
//           />
//         )}
//       </Field>
//     </div>
//   );
// }

export { OTP, Password };
