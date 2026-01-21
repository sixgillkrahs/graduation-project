import * as React from "react";

import { cn } from "@/lib/utils";
import { Field, FieldError, FieldLabel } from "./field";

function Input({
  className,
  type,
  preIcon,
  suffix,
  label,
  error,
  ...props
}: React.ComponentProps<"input"> & {
  label?: string;
  preIcon?: React.ReactNode;
  suffix?: React.ReactNode;
  error?: string;
}) {
  const id = React.useId();

  return (
    <Field>
      {label && <FieldLabel htmlFor={id}>{label}</FieldLabel>}
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
          id={id}
          className={cn(
            "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input h-9 w-full min-w-0 rounded-xl border bg-transparent px-3 py-5 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
            "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
            "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
            preIcon && "pl-10",
            suffix && "pr-10",
            className,
          )}
          {...props}
        />
      </div>
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

export { Input };
