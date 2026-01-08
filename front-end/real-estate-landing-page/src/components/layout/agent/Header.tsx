"use client";

import { sidebarMenu } from "@/shared/menu/menu.config";
import { RootState } from "@/store";
import { useSelector } from "react-redux";

const Header = () => {
  const { label } = useSelector((state: RootState) => state.menu);
  return (
    <div className="flex items-center max-h-[68px] h-[68px] justify-between p-5 border-b-2 border-white">
      <div className="text-xl font-semibold">
        {sidebarMenu.find((item) => item.key === label)?.label}
      </div>
      <div>
        <div></div>
      </div>
    </div>
  );
};

export default Header;
