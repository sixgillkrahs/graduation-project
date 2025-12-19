"use client";

import { useState } from "react";
import styles from "./slider.module.css";

const Slider = ({ min = 0, max = 10000, step = 10 }) => {
  const [value, setValue] = useState(max / 2);

  const percent = ((value - min) / (max - min)) * 100;

  return (
    <div>
      <div className="flex items-center justify-between bg-black/10 rounded-full p-2">
        <span className="text-sm main-color-red font-medium">
          ${min.toLocaleString()}K
        </span>
        <span className="text-sm main-color-red font-medium">
          ${max.toLocaleString()}K
        </span>
      </div>

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
          onChange={(e) => setValue(Number(e.target.value))}
          className="
            absolute inset-0 w-full
            appearance-none bg-transparent
            cursor-pointer
          "
        />
      </div>
    </div>
  );
};

export { Slider };
