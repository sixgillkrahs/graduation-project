import { useId } from "react";
import { Field, FieldDescription, FieldLabel } from "../ui/field";
import { Checkbox } from "@/components/animate-ui/components/radix/checkbox";

export interface CsCheckboxProps {
  label?: string;
  description?: string;
  disabled?: boolean;
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
}

const CsCheckbox = ({
  label,
  description,
  disabled,
  checked,
  onCheckedChange,
}: CsCheckboxProps) => {
  const id = useId();

  return (
    <Field>
      <div className="flex items-center gap-2">
        <Checkbox
          id={id}
          disabled={disabled}
          checked={checked}
          onCheckedChange={onCheckedChange}
        />
        {label && <FieldLabel htmlFor={id}>{label}</FieldLabel>}
      </div>

      {description && <FieldDescription>{description}</FieldDescription>}
    </Field>
  );
};

export { CsCheckbox };
