"use client";

import { Siderbar } from "@/components/ui/siderbar";
import { sidebarMenu } from "@/shared/menu/menu.config";
import Header from "./Header";
import Image from "next/image";
import Logo from "@/assets/Logo.svg";
import { setLabel } from "@/store/menu.store";
import { useDispatch } from "react-redux";

const Sidebar = ({ children }: { children: React.ReactNode }) => {
  const dispatch = useDispatch();
  const handleClickMenu = (title: string, href: string) => {
    dispatch(setLabel({ title, href }));
  };

  return (
    <Siderbar
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
