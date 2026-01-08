"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import clsx from "clsx";

interface ItemTabs {
  title: string;
  children?: React.ReactNode;
}

const Tabs = ({
  items,
  fullWidth,
}: {
  items: ItemTabs[];
  fullWidth?: boolean;
}) => {
  const [activeTab, setActiveTab] = useState(0);

  const handleClick = (index: number) => {
    setActiveTab(index);
  };

  return (
    <div className="flex items-center cs-bg-gray rounded-full p-1 gap-1">
      {items.map((item, index) => (
        <div
          key={index}
          className={clsx(
            "cs-paragraph-white text-[16px]! cursor-pointer px-4 py-2 rounded-full whitespace-nowrap relative z-10 transition-colors duration-200",
            fullWidth && "flex-1 w-full text-center",
            activeTab === index
              ? "text-white"
              : "text-black hover:text-gray-600"
          )}
          onClick={() => handleClick(index)}
        >
          {activeTab === index && (
            <motion.div
              layoutId="active-tab-background"
              className="absolute inset-0 cs-bg-black rounded-full -z-10"
              transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
            />
          )}
          {item.title}
        </div>
      ))}
    </div>
  );
};

export { Tabs };
