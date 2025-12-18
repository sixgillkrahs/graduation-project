import React, { useState } from "react";

interface ItemTabs {
  title: string;
  children?: React.ReactNode;
}

const Tabs = ({ items }: { items: ItemTabs[] }) => {
  const [activeTab, setActiveTab] = useState(0);

  const handleClick = (index: number) => {
    setActiveTab(index);
  };

  return (
    <div className="flex justify-between items-center cs-bg-gray rounded-full">
      {items.map((item, index) => (
        <div
          key={index}
          className={`cs-paragraph-white text-[16px]! text-black cursor-pointer px-4 py-2 rounded-full flex-1 text-center ${
            activeTab === index ? "cs-bg-black text-white" : "bg-transparent"
          }`}
          onClick={() => handleClick(index)}
        >
          {item.title}
        </div>
      ))}
    </div>
  );
};

export default Tabs;
