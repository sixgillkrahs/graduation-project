"use client";

import React, { useEffect, useRef, useState, forwardRef } from "react";
import { Icon } from "../Icon";

export interface Option {
  label: string;
  value: string | number;
}

interface SelectProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  label?: string;
  options?: Option[];
  error?: string;
  // Override onChange để tương thích với cả React thông thường và RHF
  onChange?: (e: any) => void;
}

// Sử dụng forwardRef để nhận ref từ ...register
const Select = forwardRef<HTMLButtonElement, SelectProps>(
  (
    {
      label,
      placeholder = "Select",
      options = [],
      error,
      className = "",
      name,
      value,
      onChange, // Hàm này sẽ đến từ ...register
      onBlur, // Hàm này sẽ đến từ ...register
      disabled,
      ...rest
    },
    ref
  ) => {
    const [open, setOpen] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    // Xử lý click outside
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

    // Hàm xử lý khi chọn option
    const handleSelect = (optionValue: string | number) => {
      // Quan trọng: Tạo một "fake event" để React Hook Form hiểu được
      const fakeEvent = {
        target: {
          name: name,
          value: optionValue,
        },
      };

      // Gọi onChange của register
      if (onChange) {
        onChange(fakeEvent);
      }

      setOpen(false);
    };

    // Tìm label hiển thị dựa trên value hiện tại
    const selectedOption = options.find(
      (opt) => String(opt.value) === String(value)
    );

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
              border border-black/10 rounded-full px-4 py-2
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
                selectedOption ? "text-black" : "text-gray-400"
              }`}
            >
              {selectedOption ? selectedOption.label : placeholder}
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
                      cursor-pointer px-4 py-2 text-sm text-gray-700
                      hover:bg-gray-100 transition-colors
                      ${
                        String(value) === String(opt.value)
                          ? "bg-blue-50 text-blue-600 font-medium"
                          : ""
                      }
                    `}
                  >
                    {opt.label}
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
