"use client";

import Logo from "@/assets/Logo.svg";
import { CsSidebar } from "@/components/custom";
import { sidebarMenu } from "@/shared/menu/menu.config";
import { setLabel } from "@/store/menu.store";
import Image from "next/image";
import { useDispatch } from "react-redux";
import Header from "./Header";

const Sidebar = ({ children }: { children: React.ReactNode }) => {
  const dispatch = useDispatch();
  const handleClickMenu = (title: string, href: string) => {
    dispatch(setLabel({ title, href }));
  };

  return (
    <CsSidebar
      items={sidebarMenu}
      children={children}
      header={<Header />}
      logo={<Image src={Logo} alt="logo" width={24} height={24} />}
      info={{
        name: "Havenly Agent",
        plan: "Basic Plan",
      }}
      onClick={handleClickMenu}
    />
  );
};

export default Sidebar;
