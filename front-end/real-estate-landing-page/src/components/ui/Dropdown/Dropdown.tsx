"use client";

import { useState, type ReactNode } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface DropdownProps {
  trigger: ReactNode;
  children: ReactNode;
  align?: "left" | "right" | "center";
  placement?: "bottom" | "top";
  width?: number | string;
}

const Dropdown = ({
  trigger,
  children,
  align = "right",
  placement = "bottom",
  width = 200,
}: DropdownProps) => {
  const [open, setOpen] = useState(false);

  // Map our custom align to Radix UI align values
  const radixAlign =
    align === "center" ? "center" : align === "right" ? "end" : "start";

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div className="cursor-pointer inline-block outline-none">
          {trigger}
        </div>
      </PopoverTrigger>

      <PopoverContent
        side={placement}
        align={radixAlign}
        sideOffset={8}
        className="z-9999 rounded-xl border border-gray-200 bg-white shadow-lg overflow-hidden p-0"
        style={{ width, minWidth: width }}
        onClick={() => setOpen(false)}
      >
        {children}
      </PopoverContent>
    </Popover>
  );
};

export default Dropdown;
