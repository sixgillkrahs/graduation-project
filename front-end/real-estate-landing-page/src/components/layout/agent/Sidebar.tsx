"use client";

import Logo from "@/assets/Logo.svg";
import { CsSidebar } from "@/components/custom";
import { useLandingSettings } from "@/components/providers/LandingSettingsProvider";
import { fetchProfileItem } from "@/store/profile.store";
import { setLabel } from "@/store/menu.store";
import type { AppDispatch, RootState } from "@/store";
import Image from "next/image";
import { useLocale } from "next-intl";
import { usePathname } from "next/navigation";
import { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Building2, LayoutDashboard, Star, Users } from "lucide-react";
import { CalendarSchedule } from "@/components/ui/Icon/CalendarSchedule";
import { Icon } from "@/components/ui/Icon";
import Header from "./Header";

const Sidebar = ({ children }: { children: React.ReactNode }) => {
  const settings = useLandingSettings();
  const dispatch = useDispatch<AppDispatch>();
  const locale = useLocale();
  const pathname = usePathname();
  const { data: profile, loading } = useSelector(
    (state: RootState) => state.profile,
  );
  const isVi = locale.toLowerCase().startsWith("vi");

  useEffect(() => {
    if (!profile) {
      dispatch(fetchProfileItem());
    }
  }, [dispatch, profile]);

  const isPro = profile?.planInfo?.plan === "PRO";

  const sidebarMenu = useMemo(
    () => [
      {
        title: isVi ? "Tổng quan" : "Dashboard",
        icon: <LayoutDashboard />,
        url: "/agent/dashboard",
      },
      {
        title: isVi ? "Tin đăng" : "My Listings",
        icon: <Building2 />,
        url: "/agent/listings",
      },
      {
        title: isVi ? "Chủ nhà" : "Landlords",
        icon: <Users />,
        url: "/agent/landlord",
      },
      {
        title: isVi ? "Khách hàng & CRM" : "Leads & CRM",
        icon: <Users />,
        url: "/agent/crm",
      },
      {
        title: isVi ? "Lịch hẹn" : "Schedule",
        icon: <CalendarSchedule />,
        url: "/agent/schedule",
      },
      {
        title: isVi ? "Tin nhắn" : "Messages",
        icon: <Icon.Message />,
        url: "/agent/messages",
      },
      {
        title: isVi ? "Đánh giá" : "Reviews",
        icon: <Star />,
        url: "/agent/reviews",
      },
      {
        title: isVi ? "Hồ sơ" : "Profile",
        icon: <Icon.User />,
        url: "/agent/profile",
      },
    ],
    [isVi],
  );

  useEffect(() => {
    const activeItem = [...sidebarMenu]
      .sort((a, b) => b.url.length - a.url.length)
      .find((item) => pathname === item.url || pathname.startsWith(`${item.url}/`));

    if (activeItem) {
      dispatch(setLabel({ title: activeItem.title, href: activeItem.url }));
    }
  }, [dispatch, pathname, sidebarMenu]);

  const handleClickMenu = (url: string, title: string) => {
    dispatch(setLabel({ title, href: url }));
  };

  return (
    <CsSidebar
      items={sidebarMenu}
      header={<Header />}
      logo={<Image src={Logo} alt="logo" width={24} height={24} />}
      info={{
        name: `${settings.systemName} ${isVi ? "Môi giới" : "Agent"}`,
        plan: isPro
          ? `${isVi ? "Gói PRO" : "PRO Plan"} ✓`
          : isVi
            ? "Gói Cơ bản"
            : "Basic Plan",
        isLoading: loading,
      }}
      onClick={handleClickMenu}
      isPro={isPro}
      labels={{
        clientMode: isVi ? "Chế độ khách hàng" : "Client Mode",
        proTitle: isVi ? "Quyền lợi PRO" : "PRO Privileges",
        basicTitle: isVi ? "Nâng cấp gói" : "Upgrade Plan",
        proDescription: isVi
          ? "Xem toàn bộ tính năng không giới hạn và quyền lợi đang hoạt động."
          : "View your unlimited features and active benefits.",
        basicDescription: isVi
          ? "Mở khóa tin đăng không giới hạn, công cụ AI và hỗ trợ ưu tiên."
          : "Unlock unlimited listings, AI tools, and priority support.",
        proAction: isVi ? "Xem chi tiết gói" : "View Plan Details",
        basicAction: isVi ? "Nâng cấp PRO" : "Upgrade to Pro",
      }}
    >
      {children}
    </CsSidebar>
  );
};

export default Sidebar;
