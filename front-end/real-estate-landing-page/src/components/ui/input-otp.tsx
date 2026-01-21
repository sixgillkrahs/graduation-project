"use client";

import * as React from "react";
import {
  OTPInput,
  OTPInputContext,
  REGEXP_ONLY_CHARS,
  REGEXP_ONLY_DIGITS,
  REGEXP_ONLY_DIGITS_AND_CHARS,
} from "input-otp";
import { MinusIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Field, FieldError } from "./field";

function InputOTP({
  className,
  containerClassName,
  ...props
}: React.ComponentProps<typeof OTPInput> & {
  containerClassName?: string;
}) {
  return (
    <OTPInput
      data-slot="input-otp"
      containerClassName={cn(
        "flex items-center gap-2 has-disabled:opacity-50",
        containerClassName,
      )}
      className={cn("disabled:cursor-not-allowed", className)}
      {...props}
    />
  );
}

function InputOTPGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="input-otp-group"
      className={cn("flex items-center gap-2", className)}
      {...props}
    />
  );
}

function InputOTPSlot({
  index,
  className,
  ...props
}: React.ComponentProps<"div"> & {
  index: number;
}) {
  const inputOTPContext = React.useContext(OTPInputContext);
  const { char, hasFakeCaret, isActive } = inputOTPContext?.slots[index] ?? {};

  return (
    <div
      data-slot="input-otp-slot"
      data-active={isActive}
      className={cn(
        "data-[active=true]:border-ring data-[active=true]:ring-ring/50 data-[active=true]:aria-invalid:ring-destructive/20 dark:data-[active=true]:aria-invalid:ring-destructive/40 aria-invalid:border-destructive data-[active=true]:aria-invalid:border-destructive dark:bg-input/30 relative flex h-[42px] w-[42px] items-center justify-center border border-input text-sm shadow-xs transition-all outline-none rounded-md data-[active=true]:z-10 data-[active=true]:ring-[3px]",
        className,
      )}
      {...props}
    >
      {char}
      {hasFakeCaret && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="animate-caret-blink bg-foreground h-4 w-px duration-1000" />
        </div>
      )}
    </div>
  );
}

function InputOTPSeparator({ ...props }: React.ComponentProps<"div">) {
  return (
    <div data-slot="input-otp-separator" role="separator" {...props}>
      <MinusIcon />
    </div>
  );
}

function OTP({
  maxLength,
  error,
  pattern = "both",
  ...props
}: {
  maxLength: number;
  error?: string;
  pattern?: "digitals" | "alphanumeric" | "both";
  onChange?: (value: string) => void;
  disabled?: boolean;
  className?: string;
  containerClassName?: string;
}) {
  return (
    <Field>
      <InputOTP
        maxLength={maxLength}
        pattern={
          pattern === "digitals"
            ? REGEXP_ONLY_DIGITS
            : pattern === "alphanumeric"
              ? REGEXP_ONLY_CHARS
              : REGEXP_ONLY_DIGITS_AND_CHARS
        }
        {...props}
      >
        <InputOTPGroup>
          {Array.from({ length: maxLength }).map((_, index) => (
            <InputOTPSlot key={index} index={index} aria-invalid={!!error} />
          ))}
        </InputOTPGroup>
      </InputOTP>
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
  );
}

export { OTP };
