import { CsButton } from "../custom";
import { Field } from "./field";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { HexColorPicker } from "react-colorful";
import { cn } from "@/lib/utils";

function InputColor({
  color,
  setColor,
  className,
  background,
}: {
  color: string;
  setColor: (color: string) => void;
  className?: string;
  background?: string;
}) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <div
          className={cn("flex items-center gap-2 cursor-pointer", className)}
        >
          <div
            className="w-full h-full rounded-full"
            style={{ background: background || color }}
          />
        </div>
      </PopoverTrigger>

      <PopoverContent className="w-auto p-3">
        <HexColorPicker color={color} onChange={setColor} />
      </PopoverContent>
    </Popover>
  );
}

export default InputColor;
