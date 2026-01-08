import clsx from "clsx";
import React, { ReactNode } from "react";

export interface CardStatsProps {
  title: string;
  value: string;
  icon: ReactNode;
  color: string;
  percentage?: number;
  type?: "increase" | "decrease" | "static";
}

const CardStats = ({
  title,
  value,
  icon,
  color,
  percentage,
  type,
}: CardStatsProps) => {
  return (
    <div className="bg-white p-6 grid justify-items-center gap-10 rounded-2xl shadow-xl">
      <div className="flex justify-between w-full">
        <div
          className={clsx("p-4 rounded-3xl", {
            "bg-blue-100": color === "blue",
            "bg-green-100": color === "green",
            "bg-purple-100": color === "purple",
            "bg-orange-100": color === "orange",
            "bg-red-100": color === "red",
          })}
        >
          {icon}
        </div>
        <div
          className={clsx(
            "text-sm h-fit px-4 py-2 rounded-2xl font-bold",
            type === "increase"
              ? "text-green-500 bg-green-100"
              : type === "decrease"
              ? "text-red-500 bg-red-100"
              : "text-gray-500 bg-gray-100"
          )}
        >
          {type === "increase" ? "+" : type === "decrease" ? "-" : ""}
          {percentage}%
        </div>
      </div>
      <div className="grid w-full">
        <div className="cs-paragraph-gray text-xl! font-medium!">{title}</div>
        <div className="cs-typography text-3xl! font-semibold!">{value}</div>
      </div>
    </div>
  );
};

export default CardStats;
