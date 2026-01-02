"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

interface DropdownProps {
  trigger: ReactNode;
  children: ReactNode;
  align?: "left" | "right";
  width?: number | string;
}

const Dropdown = ({
  trigger,
  children,
  align = "right",
  width = 200,
}: DropdownProps) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative inline-block">
      <div onClick={() => setOpen((prev) => !prev)}>{trigger}</div>

      {open && (
        <div
          className={`absolute z-50 mt-2 rounded-xl border border-gray-200 bg-white shadow-lg overflow-hidden
            ${align === "right" ? "right-0" : "left-0"}`}
          style={{ width }}
        >
          {children}
        </div>
      )}
    </div>
  );
};

export default Dropdown;
