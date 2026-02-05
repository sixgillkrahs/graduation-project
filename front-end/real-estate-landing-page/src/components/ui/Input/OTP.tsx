import { ChangeEvent, InputHTMLAttributes, useEffect, useRef } from "react";
import clsx from "clsx";

interface OTPProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "onChange" | "value"> {
  length?: number;
  name?: string;
  value?: string;
  error?: string;
  className?: string;
  onValueChange?: (value: string) => void;
  register?: any;
}

const OTP = ({
  length = 4,
  value = "",
  name,
  error,
  className,
  onValueChange,
  register,
  ...rest
}: OTPProps) => {
  const inputsRef = useRef<HTMLInputElement[]>([]);

  useEffect(() => {
    inputsRef.current[0]?.focus();
  }, []);

  const values = Array.from({ length }, (_, i) => value?.charAt(i) ?? "");

  const triggerChange = (vals: string[]) => {
    onValueChange?.(vals.join(""));
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>, index: number) => {
    const val = e.target.value;
    if (!/^\d?$/.test(val)) return;

    const newValues = [...values];
    newValues[index] = val;
    triggerChange(newValues);

    if (val && index < length - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number,
  ) => {
    if (e.key === "Backspace") {
      if (values[index]) {
        const newValues = [...values];
        newValues[index] = "";
        triggerChange(newValues);
      } else if (index > 0) {
        inputsRef.current[index - 1]?.focus();
      }
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const paste = e.clipboardData.getData("text").replace(/\D/g, "");
    const digits = paste.slice(0, length);

    if (!digits) return;

    const newValues = Array.from({ length }, (_, i) => digits.charAt(i) || "");
    triggerChange(newValues);

    const lastIndex = Math.min(digits.length, length) - 1;
    inputsRef.current[lastIndex]?.focus();
  };

  return (
    <div className="flex flex-col gap-1">
      <div className={clsx("flex gap-2", className)}>
        {Array.from({ length }).map((_, index) => (
          <input
            key={index}
            ref={(el) => {
              if (el) inputsRef.current[index] = el;
            }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            className={clsx(
              "w-12 h-12 rounded-md border text-center text-xl outline-none transition",
              "focus:border-red-500",
              error ? "border-red-500" : "border-gray-300",
            )}
            value={values[index] || ""}
            onChange={(e) => handleChange(e, index)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            onPaste={handlePaste}
            {...(register ? register(name) : {})}
            {...rest}
          />
        ))}
      </div>

      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  );
};

export default OTP;
