import { cn } from "@/lib/utils";
import { CsButton } from "../custom";
import { Field, FieldLabel } from "./field";

const Counter = ({
  value,
  onChange,
  label,
  alignLabel,
  className,
}: {
  value: number;
  onChange: (val: number) => void;
  label: string;
  alignLabel?: "left" | "right";
  className?: string;
}) => {
  return (
    <Field
      className={cn("w-fit gap-2", className)}
      orientation={alignLabel ? "horizontal" : "vertical"}
      // If "right", reverse the flex direction so input comes first, then label.
      // If "left", natural row order: label then input.
      // If default, vertical column: label then input.
      style={{
        flexDirection:
          alignLabel === "right"
            ? "row-reverse"
            : alignLabel === "left"
              ? "row"
              : "column",
        alignItems: alignLabel ? "center" : "stretch",
      }}
    >
      <FieldLabel>{label}</FieldLabel>
      <div className="flex items-center gap-4 bg-white border border-gray-200 rounded-xl p-2 w-fit">
        <CsButton
          type="button"
          onClick={() => onChange(Math.max(0, value - 1))}
          className="w-6 h-6 flex items-center justify-center rounded-lg bg-white! hover:bg-gray-100 text-gray-600 shadow-none"
        >
          -
        </CsButton>
        <span className="w-6 text-center font-medium text-base">{value}</span>
        <CsButton
          type="button"
          onClick={() => onChange(value + 1)}
          className="w-6 h-6 flex items-center justify-center rounded-lg bg-white! hover:bg-gray-100 text-gray-600 shadow-none"
        >
          +
        </CsButton>
      </div>
    </Field>
  );
};

export { Counter };
