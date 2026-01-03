"use client";

import { useState } from "react";

const Slider = ({
  min = 0,
  max = 10000,
  step = 10,
  hiddenStat = false,
  currentValue = max / 2,
  onChange = (value: number) => {},
  disabled = false,
}: {
  min: number;
  max: number;
  step: number;
  hiddenStat?: boolean;
  currentValue?: number;
  onChange?: (value: number) => void;
  disabled?: boolean;
}) => {
  const [value, setValue] = useState(currentValue);

  const percent = ((value - min) / (max - min)) * 100;

  const format = (value: number) =>
    new Intl.NumberFormat("en-US").format(value);

  return (
    <div>
      {!hiddenStat && (
        <div className="flex items-center justify-between bg-black/10 rounded-full p-2">
          <span className="text-sm main-color-red font-medium">
            ${format(min)}K
          </span>
          <span className="text-sm main-color-red font-medium">
            ${format(max)}K
          </span>
        </div>
      )}

      <div className="relative my-4 h-2">
        <div className="absolute inset-0 rounded-full bg-black/10" />

        <div
          className="absolute h-2 rounded-full cs-bg-red"
          style={{ width: `${percent}%` }}
        />

        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => {
            setValue(Number(e.target.value));
            onChange(Number(e.target.value));
          }}
          className={`
            absolute inset-0 w-full
            appearance-none bg-transparent
            cursor-pointer
          ${disabled ? "pointer-events-none" : ""}
          `}
        />
      </div>
    </div>
  );
};

export { Slider };
