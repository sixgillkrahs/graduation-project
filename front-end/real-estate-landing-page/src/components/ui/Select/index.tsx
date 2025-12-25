"use client";

import React, { useEffect, useRef, useState, forwardRef } from "react";
import { Icon } from "../Icon";

export interface Option {
  label: string;
  value: string | number;
}

interface SelectProps<T extends string | number | (string | number)[]>
  extends Omit<
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    "onChange" | "value"
  > {
  label?: string;
  options?: Option[];
  error?: string;
  multiple?: boolean;
  value?: T;
  placeholder?: string;
  onChange?: (e: { target: { name?: string; value: T } }) => void;
}

const Select = forwardRef<
  HTMLButtonElement,
  SelectProps<string | number | (string | number)[]>
>(
  (
    {
      label,
      placeholder = "Select",
      options = [],
      error,
      className = "",
      name,
      value,
      onChange,
      onBlur,
      disabled,
      multiple = false,
      ...rest
    },
    ref
  ) => {
    const [open, setOpen] = useState(false);
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
    }, [multiple]);

    const handleSelect = (optionValue: string | number) => {
      let newValue: string | number | (string | number)[];

      if (multiple) {
        const currentValues = Array.isArray(value) ? value : [];
        if (currentValues.includes(optionValue)) {
          newValue = currentValues.filter((val) => val !== optionValue);
        } else {
          newValue = [...currentValues, optionValue];
        }
      } else {
        newValue = optionValue;
        setOpen(false);
      }

      const fakeEvent = {
        target: {
          name: name,
          value: newValue,
        },
      };

      if (onChange) {
        onChange(
          fakeEvent as { target: { name?: string; value: typeof newValue } }
        );
      }
    };

    // Tìm label hiển thị dựa trên value hiện tại (cho cả single và multi-select)
    const getDisplayLabel = () => {
      if (multiple && Array.isArray(value)) {
        const selectedLabels = options
          .filter((opt) => value.includes(opt.value))
          .map((opt) => opt.label);
        return selectedLabels.length > 0
          ? selectedLabels.join(", ")
          : placeholder;
      } else {
        const selectedOption = options.find(
          (opt) => String(opt.value) === String(value)
        );
        return selectedOption ? selectedOption.label : placeholder;
      }
    };

    const isOptionSelected = (optValue: string | number) => {
      if (multiple && Array.isArray(value)) {
        return value.includes(optValue);
      } else {
        return String(value) === String(optValue);
      }
    };

    return (
      <div className="flex flex-col gap-1" ref={wrapperRef}>
        {label && (
          <label className="cs-paragraph text-sm! font-medium!">{label}</label>
        )}

        <div className="relative w-full">
          {/* Gán ref vào button để RHF có thể focus vào đây khi có lỗi validate */}
          <button
            ref={ref}
            type="button"
            name={name}
            onClick={() => !disabled && setOpen((prev) => !prev)}
            onBlur={onBlur} // Gọi onBlur của register để đánh dấu field đã touched
            disabled={disabled}
            className={`
            flex items-center justify-between w-full
            border border-black/10 rounded-full px-4 py-2.5
            bg-white outline-none transition-all
            ${error ? "border-red-500" : ""}
            ${
              disabled
                ? "bg-gray-100 cursor-not-allowed"
                : "cursor-pointer hover:border-black/30"
            }
            ${className}
          `}
            {...rest}
          >
            <span
              className={`text-sm truncate ${
                (multiple && Array.isArray(value) && value.length > 0) ||
                (!multiple && value)
                  ? "text-black"
                  : "text-gray-400"
              }`}
            >
              {getDisplayLabel()}
            </span>

            <Icon.ArrowDown
              className={`h-5 w-5 text-gray-500 transition-transform duration-200 ${
                open ? "rotate-180" : ""
              }`}
            />
          </button>

          {/* Dropdown Menu */}
          {open && !disabled && (
            <ul
              className="
              absolute z-50 mt-1 w-full max-h-60 overflow-auto
              rounded-xl border border-black/10
              bg-white shadow-lg py-1
            "
            >
              {options.length > 0 ? (
                options.map((opt) => (
                  <li
                    key={opt.value}
                    onClick={(e) => {
                      e.stopPropagation(); // Ngăn sự kiện nổi bọt
                      handleSelect(opt.value);
                    }}
                    className={`
                    flex items-center justify-between
                    cursor-pointer px-4 py-2 text-sm text-gray-700
                    hover:bg-gray-100 transition-colors
                    ${
                      isOptionSelected(opt.value)
                        ? "bg-blue-50 text-blue-600 font-medium"
                        : ""
                    }
                  `}
                  >
                    {opt.label}
                    {multiple && isOptionSelected(opt.value) && (
                      <Icon.CheckMark className="h-5 w-5" />
                    )}
                  </li>
                ))
              ) : (
                <li className="px-4 py-2 text-sm text-gray-400 text-center">
                  No options
                </li>
              )}
            </ul>
          )}
        </div>

        {error && <p className="text-red-500 text-sm! font-medium!">{error}</p>}
      </div>
    );
  }
);

Select.displayName = "Select";

export { Select };
