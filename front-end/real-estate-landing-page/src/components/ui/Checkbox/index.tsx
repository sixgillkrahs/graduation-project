"use client";

import React, { forwardRef } from "react";

interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: React.ReactNode;
  error?: string;
  subtext?: React.ReactNode;
}

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, subtext, error, className = "", disabled, ...rest }, ref) => {
    return (
      <div className={`flex flex-col gap-1 ${className}`}>
        <label
          className={`
            flex items-start gap-3 cursor-pointer group relative
            ${disabled ? "opacity-50 cursor-not-allowed" : ""}
          `}
        >
          <div className="relative flex items-center mt-0.5">
            <input
              type="checkbox"
              ref={ref}
              disabled={disabled}
              className="peer sr-only"
              {...rest}
            />

            <div
              className={`
                h-5 w-5 rounded border transition-all duration-200 ease-in-out
                flex items-center justify-center
                
                bg-white border-black/20 
                
                group-hover:border-blue-500

                peer-checked:bg-blue-600 peer-checked:border-blue-600
                
                /* --- DÒNG QUAN TRỌNG ĐÃ SỬA --- */
                /* Khi peer checked, tìm thẻ svg bên trong (&_svg) và set opacity 100 */
                peer-checked:[&_svg]:opacity-100
                
                ${error ? "border-red-500" : ""}
              `}
            >
              <svg
                className="w-3.5 h-3.5 text-white opacity-0 transition-opacity duration-200 pointer-events-none"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="3"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
          </div>

          <div className="grid gap-1">
            {label && (
              <span className="text-[14px] font-bold text-black select-none pt-[1px]">
                {label}
              </span>
            )}
            {label && (
              <span className="text-sm text-gray-700 select-none font-medium pt-[1px]">
                {subtext}
              </span>
            )}
          </div>
        </label>

        {error && <p className="text-red-500 text-sm! font-medium!">{error}</p>}
      </div>
    );
  },
);

Checkbox.displayName = "Checkbox";

export { Checkbox };
