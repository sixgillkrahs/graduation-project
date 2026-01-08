"use client";

import Logo from "@/assets/Logo.svg";
import { Icon } from "@/components/ui";
import { Menu } from "@/components/ui/Menu";
import { sidebarMenu } from "@/shared/menu/menu.config";
import clsx from "clsx";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useDispatch } from "react-redux";
import { setLabel } from "@/store/menu.store";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { useEffect, useState } from "react";

const Sidebar = () => {
  const dispatch = useDispatch();
  const { label } = useSelector((state: RootState) => state.menu);
  const [activeKey, setActiveKey] = useState(label);
  const pathname = usePathname();

  useEffect(() => {
    setActiveKey(label);
  }, [label]);

  useEffect(() => {
    const currentMenu = sidebarMenu.find((item) => item.href === pathname);
    console.log(currentMenu);
    if (currentMenu && currentMenu.key) {
      dispatch(setLabel(currentMenu.key));
    }
  }, [pathname, dispatch]);

  const onClickMenu = (key: string) => {
    setActiveKey(key);
    dispatch(setLabel(key));
  };

  const [collapsed, setCollapsed] = useState(false);

  return (
    <div
      className={clsx(
        "h-full flex flex-col justify-between cs-bg transition-all duration-300 relative border-r border-black/10",
        collapsed ? "w-20" : "w-64"
      )}
    >
      <div>
        {/* logo */}
        <div
          className={clsx(
            "flex items-center gap-2 p-5 justify-center relative h-[68px] max-h-[68px]",
            collapsed ? "px-2" : "px-5"
          )}
        >
          <Image src={Logo} alt="logo" width={24} height={24} />
          {!collapsed && (
            <span className="text-xl font-semibold whitespace-nowrap">
              Havenly Agent
            </span>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-white border border-black/10 rounded-full flex items-center justify-center cursor-pointer hover:bg-gray-50 z-10"
          >
            {collapsed ? (
              <Icon.ArrowRight className="w-4 h-4" />
            ) : (
              <Icon.ArrowLeft className="w-4 h-4" />
            )}
          </button>
        </div>
        {/* separator */}
        <div className="h-px bg-black/10" />
        {/* menu */}
        <Menu
          items={sidebarMenu}
          selectedKey={activeKey}
          onSelect={(key) => onClickMenu(key)}
          className={clsx(collapsed ? "items-center px-2" : "px-3")}
          collapsed={collapsed}
        />
      </div>
      {/* separator */}
      <div className="border-t border-black/10">
        <Link
          href="/"
          className={clsx(
            "flex items-center p-5 gap-2 font-bold",
            collapsed ? "justify-center" : ""
          )}
        >
          <Icon.ArrowLeft />
          {!collapsed && <span className="whitespace-nowrap">Client Mode</span>}
        </Link>
      </div>
    </div>
  );
};

export default Sidebar;
