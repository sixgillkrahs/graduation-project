"use client";

import Logo from "@/assets/Logo.svg";
import { CsSidebar } from "@/components/custom";
import { sidebarMenu } from "@/shared/menu/menu.config";
import { setLabel } from "@/store/menu.store";
import Image from "next/image";
import { useDispatch } from "react-redux";
import Header from "./Header";
import { useProfile } from "@/components/features/profile/services/query";

const Sidebar = ({ children }: { children: React.ReactNode }) => {
  const dispatch = useDispatch();
  const { data: profile } = useProfile();

  const isPro = profile?.data?.planInfo?.plan === "PRO";

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
        plan: isPro ? "PRO Plan ✓" : "Basic Plan",
      }}
      onClick={handleClickMenu}
      isPro={isPro}
    />
  );
};

export default Sidebar;
