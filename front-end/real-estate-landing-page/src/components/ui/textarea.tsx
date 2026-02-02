import * as React from "react";

import { cn } from "@/lib/utils";
import { Field, FieldDescription, FieldError, FieldLabel } from "./field";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 flex field-sizing-content min-h-16 w-full rounded-md border bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        className,
      )}
      {...props}
    />
  );
}

function CsTextarea({
  className,
  label,
  description,
  error,
  ...props
}: React.ComponentProps<"textarea"> & {
  label: string;
  description?: string;
  error?: string;
}) {
  const id = React.useId();
  return (
    <Field data-invalid={!!error}>
      {label && <FieldLabel htmlFor={id}>{label}</FieldLabel>}
      <textarea
        data-slot="textarea"
        aria-invalid={!!error}
        className={cn(
          "border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 flex field-sizing-content min-h-16 w-full rounded-xl border bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className,
        )}
        id={id}
        {...props}
      />
      {description && <FieldDescription>{description}</FieldDescription>}
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

export { Textarea, CsTextarea };
