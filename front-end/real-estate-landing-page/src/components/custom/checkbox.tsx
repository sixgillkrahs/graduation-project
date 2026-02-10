import { useId } from "react";
import { Field, FieldDescription, FieldLabel } from "../ui/field";
import { Checkbox } from "@/components/animate-ui/components/radix/checkbox";

export interface CsCheckboxProps {
  label?: string;
  description?: string;
  disabled?: boolean;
}

const CsCheckbox = ({ label, description, disabled }: CsCheckboxProps) => {
  const id = useId();

  return (
    <Field>
      <div className="flex items-center gap-2">
        <Checkbox id={id} disabled={disabled} />
        {label && <FieldLabel htmlFor={id}>{label}</FieldLabel>}
      </div>

      {description && <FieldDescription>{description}</FieldDescription>}
    </Field>
  );
};

export { CsCheckbox };
