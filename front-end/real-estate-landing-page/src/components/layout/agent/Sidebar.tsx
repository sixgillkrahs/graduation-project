"use client";

import Logo from "@/assets/Logo.svg";
import { CsSidebar } from "@/components/custom";
import { sidebarMenu } from "@/shared/menu/menu.config";
import { setLabel } from "@/store/menu.store";
import Image from "next/image";
import { useDispatch, useSelector } from "react-redux";
import Header from "./Header";
import { useEffect } from "react";
import { fetchProfileItem } from "@/store/profile.store";
import { RootState, AppDispatch } from "@/store";

const Sidebar = ({ children }: { children: React.ReactNode }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { data: profile, loading } = useSelector(
    (state: RootState) => state.profile,
  );

  useEffect(() => {
    if (!profile) {
      dispatch(fetchProfileItem());
    }
  }, [dispatch, profile]);

  const isPro = profile?.planInfo?.plan === "PRO";

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
        isLoading: loading,
      }}
      onClick={handleClickMenu}
      isPro={isPro}
    />
  );
};

export default Sidebar;
