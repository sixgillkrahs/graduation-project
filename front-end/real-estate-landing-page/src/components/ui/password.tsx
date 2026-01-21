import { Eye, EyeClosed } from "lucide-react";
import { ChangeEvent, InputHTMLAttributes, ReactNode, useState } from "react";
import { Input } from "./input";

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
          <Eye
            className="main-color-gray w-5 h-5 cursor-pointer"
            onClick={handleTogglePassword}
          />
        ) : (
          <EyeClosed
            className="main-color-gray w-5 h-5 cursor-pointer"
            onClick={handleTogglePassword}
          />
        )
      }
      {...rest}
    />
  );
};

export { Password };
