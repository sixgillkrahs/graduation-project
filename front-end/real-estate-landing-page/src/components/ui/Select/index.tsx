"use client";

import { useEffect, useRef, useState } from "react";
import { Icon } from "../Icon/Icon";

export interface SelectProps {
  placeholder?: string;
  options?: {
    label: string;
    value: string;
  }[];
}

export default function Select({
  placeholder = "Select",
  options = [],
}: SelectProps) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");

  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div ref={wrapperRef} className="relative w-full">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="
          flex h-10.5 w-full items-center justify-between
          rounded-full border border-black/10
            px-4 text-sm cursor-pointer
        "
      >
        <span className={value ? "text-gray-800" : "text-gray-400"}>
          {(value && value.charAt(0).toUpperCase() + value.slice(1)) ||
            placeholder}
        </span>
        <Icon.ArrowDown
          className={`h-5 w-5 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <ul
          className="
            absolute z-20 mt-2 w-full
            rounded-2xl border border-black/10
            bg-white shadow-lg overflow-hidden
          "
        >
          {options.map((opt) => (
            <li
              key={opt.value}
              onClick={() => {
                setValue(opt.value);
                setOpen(false);
              }}
              className="
                cursor-pointer px-4 py-2 text-sm
                text-gray-700 hover:bg-black/5
              "
            >
              {opt.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
