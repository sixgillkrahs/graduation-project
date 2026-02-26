"use client";

import Logo from "@/assets/Logo.svg";
import { ROUTES } from "@/const/routes";
import { useLogout } from "@/shared/auth/mutate";
import { useGetMe } from "@/shared/auth/query";
import { Heart, Menu, X } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { CsButton } from "../custom";
import { Dropdown, DropdownItem, Icon } from "../ui";

const Header = () => {
  const { data: me, isLoading, isError, isSuccess } = useGetMe();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { mutateAsync: logout } = useLogout();
  const t = useTranslations("Header");
  const locale = useLocale();

  useEffect(() => {
    if (isSuccess && me?.data) {
      localStorage.setItem("isLoggedIn", "true");
    } else if (isError) {
      localStorage.setItem("isLoggedIn", "false");
    }
  }, [isSuccess, isError, me]);

  const handleLogin = () => {
    router.push(ROUTES.SIGN_IN);
  };

  const handleLogout = async () => {
    await logout();
    localStorage.setItem("isLoggedIn", "false");
    router.refresh();
  };

  return (
    <header className="bg-[#ffffff] w-full sticky top-0 z-50">
      <div className="px-4 lg:px-20 container mx-auto py-4 flex justify-between items-center bg-white relative">
        <div className="flex items-center gap-8 xl:gap-12 w-full lg:w-auto justify-between lg:justify-start">
          {/* Left: Logo */}
          <div
            className="flex items-center gap-2 text-xl md:text-2xl font-semibold cursor-pointer shrink-0"
            onClick={() => router.push(ROUTES.HOME)}
          >
            <Image src={Logo} alt="logo" width={24} height={24} />
            <span className="text-black">Havenly</span>
          </div>

          {/* Center: Desktop Nav */}
          <nav className="hidden lg:block">
            <ul className="flex items-center gap-4 xl:gap-6">
              <li className="cs-typography text-[14px] xl:text-[16px]! cursor-pointer flex items-center gap-1 cs-outline-gray p-2 rounded-full px-4 whitespace-nowrap">
                {t("searchProperties")} <Icon.ArrowDown />
              </li>
              <li className="cs-paragraph text-[14px] xl:text-[16px]! cursor-pointer p-2 rounded-full px-4 cs-outline-gray whitespace-nowrap">
                {t("listForSale")}
              </li>
              <li className="cs-paragraph text-[14px] xl:text-[16px]! cursor-pointer p-2 rounded-full px-4 cs-outline-gray whitespace-nowrap">
                {t("listForRent")}
              </li>
              <li className="cs-paragraph text-[16px]! cursor-pointer p-2 rounded-full cs-outline-gray size-[40px] flex justify-center items-center">
                <Icon.ExpandUpDown />
              </li>
            </ul>
          </nav>
        </div>

        {/* Right: Actions & Hamburger */}
        <div className="flex items-center gap-4 shrink-0">
          {/* Desktop Auth */}
          <div className="hidden lg:flex justify-end min-w-[180px]">
            {isLoading ? (
              <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 cs-outline-gray animate-pulse">
                <div className="h-4 w-24 rounded bg-gray-200" />
                <div className="w-8 h-8 rounded-full bg-gray-300" />
              </div>
            ) : me?.data?.userId ? (
              <div className="flex items-center gap-2">
                {me.data.roleId.code === "AGENT" && (
                  <Link href={ROUTES.AGENT_DASHBOARD}>
                    <CsButton
                      className="cs-bg-black text-white rounded-full whitespace-nowrap"
                      icon={<Icon.Briefcase />}
                    >
                      {t("agentSpace")}
                    </CsButton>
                  </Link>
                )}
                <Link
                  href={`${ROUTES.PROPERTIES}?tab=favorites`}
                  className="relative group/fav p-2.5 rounded-full cs-outline-gray hover:bg-red-50 transition-all duration-200 cursor-pointer"
                  title={t("myFavorites")}
                >
                  <Heart className="w-5 h-5 text-gray-500 group-hover/fav:text-red-500 transition-colors duration-200" />
                </Link>
                <Dropdown
                  trigger={
                    <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 cs-outline-gray cursor-pointer">
                      <span className="whitespace-nowrap">
                        {me?.data?.userId?.fullName}
                      </span>
                      <Icon.User className="w-8 h-8 rounded-full bg-black text-white p-1.5" />
                    </div>
                  }
                >
                  <DropdownItem
                    onClick={() => router.push(ROUTES.PROFILE)}
                    icon={<Icon.User className="w-4 h-4" />}
                  >
                    {t("profile")}
                  </DropdownItem>
                  <DropdownItem
                    onClick={() =>
                      router.push(`${ROUTES.PROPERTIES}?tab=favorites`)
                    }
                    icon={<Heart className="w-4 h-4" />}
                  >
                    {t("myFavorites")}
                  </DropdownItem>
                  <DropdownItem
                    onClick={() => router.push(ROUTES.SETTINGS)}
                    icon={<Icon.Settings className="w-4 h-4" />}
                  >
                    {t("settings")}
                  </DropdownItem>
                  <div className="my-1 border-t border-gray-200" />
                  <DropdownItem
                    danger
                    onClick={handleLogout}
                    icon={<Icon.LogoutCircle className="w-4 h-4" />}
                  >
                    {t("logout")}
                  </DropdownItem>
                </Dropdown>
              </div>
            ) : (
              <div className="flex items-center rounded-full cs-outline-gray px-2 py-0.5 gap-1 whitespace-nowrap">
                <Icon.User className="bg-black w-8 h-8 p-1.5 rounded-full text-white" />
                <CsButton
                  type="button"
                  className={`bg-white! outline-none! border-none! shadow-none! text-black ${locale === "vi" ? "p-1!" : ""}`}
                  onClick={handleLogin}
                >
                  {t("login")}
                </CsButton>
              </div>
            )}
          </div>

          {/* Hamburger Menu Toggle (Mobile + Tablet) */}
          <div className="lg:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 focus:outline-none flex justify-center items-center"
            >
              <div className="relative w-6 h-6 flex justify-center items-center">
                <Menu
                  className={`absolute w-6 h-6 transition-all duration-300 ease-in-out ${
                    isMobileMenuOpen
                      ? "opacity-0 rotate-90 scale-50"
                      : "opacity-100 rotate-0 scale-100"
                  }`}
                />
                <X
                  className={`absolute w-6 h-6 transition-all duration-300 ease-in-out ${
                    isMobileMenuOpen
                      ? "opacity-100 rotate-0 scale-100"
                      : "opacity-0 -rotate-90 scale-50"
                  }`}
                />
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="lg:hidden absolute top-full left-0 right-0 bg-white shadow-lg border-t border-gray-100 max-h-[80vh] overflow-y-auto">
          <nav className="px-4 py-6">
            <ul className="flex flex-col gap-4">
              <li className="cs-typography text-[16px]! cursor-pointer flex items-center justify-between cs-outline-gray p-3 rounded-xl px-4">
                {t("searchProperties")} <Icon.ArrowDown />
              </li>
              <li className="cs-paragraph text-[16px]! cursor-pointer p-3 rounded-xl px-4 cs-outline-gray">
                {t("listForSale")}
              </li>
              <li className="cs-paragraph text-[16px]! cursor-pointer p-3 rounded-xl px-4 cs-outline-gray">
                {t("listForRent")}
              </li>

              <div className="my-2 border-b border-gray-100"></div>

              {/* Mobile Auth Actions */}
              {isLoading ? (
                <div className="flex animate-pulse items-center justify-center p-4">
                  <div className="h-4 w-24 rounded bg-gray-200" />
                </div>
              ) : me?.data?.userId ? (
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl mb-2">
                    <Icon.User className="w-10 h-10 rounded-full bg-black text-white p-2 shrink-0" />
                    <div className="flex flex-col">
                      <span className="font-semibold text-sm">
                        {me?.data?.userId?.fullName}
                      </span>
                    </div>
                  </div>

                  {me.data.roleId.code === "AGENT" && (
                    <li className="cursor-pointer">
                      <Link
                        href={ROUTES.AGENT_DASHBOARD}
                        className="flex items-center gap-3 p-3 cs-outline-gray rounded-xl bg-black text-white"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <Icon.Briefcase className="w-5 h-5" />
                        <span>{t("agentSpace")}</span>
                      </Link>
                    </li>
                  )}
                  <li
                    className="flex items-center gap-3 p-3 cs-outline-gray rounded-xl cursor-pointer"
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      router.push(ROUTES.PROFILE);
                    }}
                  >
                    <Icon.User className="w-5 h-5" />
                    <span>{t("profile")}</span>
                  </li>
                  <li
                    className="flex items-center gap-3 p-3 cs-outline-gray rounded-xl cursor-pointer"
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      router.push(`${ROUTES.PROPERTIES}?tab=favorites`);
                    }}
                  >
                    <Heart className="w-5 h-5 text-gray-500" />
                    <span>{t("myFavorites")}</span>
                  </li>
                  <li
                    className="flex items-center gap-3 p-3 cs-outline-gray rounded-xl cursor-pointer"
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      router.push(ROUTES.SETTINGS);
                    }}
                  >
                    <Icon.Settings className="w-5 h-5" />
                    <span>{t("settings")}</span>
                  </li>
                  <li
                    className="flex items-center gap-3 p-3 border border-red-200 text-red-600 rounded-xl cursor-pointer mt-2 bg-red-50"
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      handleLogout();
                    }}
                  >
                    <Icon.LogoutCircle className="w-5 h-5" />
                    <span>{t("logout")}</span>
                  </li>
                </div>
              ) : (
                <li
                  className="flex justify-center items-center rounded-xl bg-black text-white p-3 mt-2 cursor-pointer transition-transform hover:scale-[0.98]"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    handleLogin();
                  }}
                >
                  <span className="font-semibold">{t("login")}</span>
                </li>
              )}
            </ul>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
