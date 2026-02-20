"use client";

import { useId } from "react";
import {
  ToggleGroup,
  ToggleGroupItem,
  ToggleGroupProps,
} from "../animate-ui/components/radix/toggle-group";
import { Field, FieldDescription, FieldLabel } from "../ui/field";
import { cn } from "@/lib/utils";

interface CsToggleGroupProps {
  type: "single" | "multiple";
  variant: ToggleGroupProps["variant"];
  size: ToggleGroupProps["size"];
  label?: string;
  description?: string;
  items: { value: string; label: string }[];
  className?: string;
  classNameItem?: string;
  value?: string | string[];
  onValueChange?: (value: any) => void;
}

const CsToggleGroup = ({
  type,
  variant,
  size,
  label,
  description,
  items,
  className,
  classNameItem,
  value,
  onValueChange,
}: CsToggleGroupProps) => {
  const id = useId();
  return (
    <Field>
      {label && <FieldLabel htmlFor={id}>{label}</FieldLabel>}
      <ToggleGroup
        type={type}
        variant={variant}
        size={size}
        className={className}
        value={value as any}
        onValueChange={onValueChange}
      >
        {items.map((item) => (
          <ToggleGroupItem
            key={item.value}
            value={item.value}
            className={cn(
              "cs-typography-gray text-sm! font-medium!",
              classNameItem,
            )}
          >
            {item.label}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
      {description && <FieldDescription>{description}</FieldDescription>}
    </Field>
  );
};

export default CsToggleGroup;
