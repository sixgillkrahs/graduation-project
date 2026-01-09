"use client";

import React from "react";
import { Icon } from "../Icon";
import clsx from "clsx";

export interface StepItem {
  title: string;
  description?: string;
  icon?: React.ReactNode;
}

interface StepsProps {
  current: number;
  items: StepItem[];
  onChange?: (current: number) => void;
  className?: string;
}

const Steps = ({ current, items, onChange, className }: StepsProps) => {
  return (
    <div className={clsx("flex w-full justify-between", className)}>
      {items.map((item, index) => {
        const isFinished = current > index;
        const isActive = current === index;
        const isWaiting = current < index;

        return (
          <div
            key={index}
            className={clsx(
              "flex flex-1 items-start relative group",
              index !== items.length - 1 && "mr-4" // Spacing for line
            )}
            onClick={() => {
              if (onChange) onChange(index);
            }}
          >
            {/* Actually, a flex-row layout is better for the line */}
            <div className="flex-1 flex flex-col items-center relative w-full">
              {/* Line behind */}
              {index !== 0 && (
                <div
                  className={clsx(
                    "absolute top-5 right-1/2 w-1/2 h-[2px] -z-10",
                    isFinished || isActive ? "bg-black" : "bg-gray-200"
                  )}
                />
              )}
              {index !== items.length - 1 && (
                <div
                  className={clsx(
                    "absolute top-5 left-1/2 w-1/2 h-[2px] -z-10",
                    isFinished ? "bg-black" : "bg-gray-200"
                  )}
                />
              )}

              {/* Icon Wrapper */}
              <div
                className={clsx(
                  "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 z-10 cursor-pointer",
                  isFinished
                    ? "bg-white border-black text-black"
                    : isActive
                    ? "bg-black border-black text-white"
                    : "bg-white border-gray-200 text-gray-400 group-hover:border-black group-hover:text-black"
                )}
              >
                {isFinished ? (
                  <Icon.CheckMark className="w-5 h-5" />
                ) : (
                  <span className="text-sm font-semibold">{index + 1}</span>
                )}
              </div>

              {/* Content */}
              <div className="mt-3 text-center">
                <div
                  className={clsx(
                    "text-sm font-semibold transition-colors duration-300",
                    isFinished || isActive ? "text-gray-900" : "text-gray-400"
                  )}
                >
                  {item.title}
                </div>
                {item.description && (
                  <div className="text-xs text-gray-400 mt-1 max-w-[120px]">
                    {item.description}
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export { Steps };
