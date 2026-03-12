"use client";

import Logo from "@/assets/Logo.svg";
import MainNotificationBell from "@/components/layout/MainNotificationBell";
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
    <header className="bg-background w-full sticky top-0 z-50 border-b border-border">
      <div className="px-4 lg:px-20 container mx-auto py-4 flex justify-between items-center bg-background relative">
        <div className="flex items-center gap-8 xl:gap-12 w-full lg:w-auto justify-between lg:justify-start">
          {/* Left: Logo */}
          <div
            className="flex items-center gap-2 text-xl md:text-2xl font-semibold cursor-pointer shrink-0"
            onClick={() => router.push(ROUTES.HOME)}
          >
            <Image src={Logo} alt="logo" width={24} height={24} />
            <span className="text-foreground">Havenly</span>
          </div>

          {/* Center: Desktop Nav */}
          <nav className="hidden lg:block">
            <ul className="flex items-center gap-4 xl:gap-6">
              <li
                onClick={() =>
                  router.push(`${ROUTES.PROPERTIES}?demandType=SALE`)
                }
                className="cs-paragraph text-[14px] xl:text-[16px]! cursor-pointer p-2 rounded-full px-4 cs-outline-gray whitespace-nowrap text-foreground transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                {t("buyProperties")}
              </li>
              <li
                onClick={() =>
                  router.push(`${ROUTES.PROPERTIES}?demandType=RENT`)
                }
                className="cs-paragraph text-[14px] xl:text-[16px]! cursor-pointer p-2 rounded-full px-4 cs-outline-gray whitespace-nowrap text-foreground transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                {t("rentProperties")}
              </li>
              <li
                onClick={() =>
                  router.push(`${ROUTES.PROPERTIES}?hasVirtualTour=true`)
                }
                className="cs-paragraph text-[14px] xl:text-[16px]! cursor-pointer p-2 rounded-full px-4 cs-outline-gray whitespace-nowrap text-foreground transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                {t("virtualTours")}
              </li>
              <li
                onClick={() => router.push(ROUTES.LEADERBOARD)}
                className="cs-paragraph text-[14px] xl:text-[16px]! cursor-pointer p-2 rounded-full px-4 cs-outline-gray whitespace-nowrap text-foreground transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                {t("findAgents")}
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
                <div className="h-4 w-24 rounded bg-muted" />
                <div className="w-8 h-8 rounded-full bg-muted-foreground/20" />
              </div>
            ) : me?.data?.userId ? (
              <div className="flex items-center gap-2">
                <MainNotificationBell
                  isAuthenticated={Boolean(me.data.userId)}
                />
                {me.data.roleId.code === "AGENT" && (
                  <Link href={ROUTES.AGENT_DASHBOARD}>
                    <CsButton
                      className="bg-foreground text-background hover:bg-foreground/90 rounded-full whitespace-nowrap"
                      icon={<Icon.Briefcase />}
                    >
                      {t("agentSpace")}
                    </CsButton>
                  </Link>
                )}
                <Link
                  href={`${ROUTES.PROPERTIES}?tab=favorites`}
                  className="relative group/fav p-2.5 rounded-full cs-outline-gray hover:bg-destructive/10 transition-all duration-200 cursor-pointer"
                  title={t("myFavorites")}
                >
                  <Heart className="w-5 h-5 text-muted-foreground group-hover/fav:text-destructive transition-colors duration-200" />
                </Link>
                <Dropdown
                  trigger={
                    <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 cs-outline-gray cursor-pointer text-foreground">
                      <span className="whitespace-nowrap">
                        {me?.data?.userId?.fullName}
                      </span>
                      <Icon.User className="w-8 h-8 rounded-full bg-foreground text-background p-1.5" />
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
                  <div className="my-1 border-t border-border" />
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
              <div className="flex items-center rounded-full cs-outline-gray px-2 py-0.5 gap-1 whitespace-nowrap bg-background">
                <Icon.User className="bg-foreground w-8 h-8 p-1.5 rounded-full text-background" />
                <CsButton
                  type="button"
                  variant="ghost"
                  className={`bg-transparent outline-none border-none shadow-none text-foreground hover:bg-transparent ${locale === "vi" ? "p-1" : ""}`}
                  onClick={handleLogin}
                >
                  {t("login")}
                </CsButton>
              </div>
            )}
          </div>

          {/* Hamburger Menu Toggle (Mobile + Tablet) */}
          <div className="lg:hidden text-foreground">
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
        <div className="lg:hidden absolute top-full left-0 right-0 bg-background shadow-lg border-t border-border max-h-[80vh] overflow-y-auto">
          <nav className="px-4 py-6">
            <ul className="flex flex-col gap-4">
              <li
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  router.push(`${ROUTES.PROPERTIES}?demandType=SALE`);
                }}
                className="cs-paragraph text-[16px]! cursor-pointer p-3 rounded-xl px-4 cs-outline-gray text-foreground hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                {t("buyProperties")}
              </li>
              <li
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  router.push(`${ROUTES.PROPERTIES}?demandType=RENT`);
                }}
                className="cs-paragraph text-[16px]! cursor-pointer p-3 rounded-xl px-4 cs-outline-gray text-foreground hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                {t("rentProperties")}
              </li>
              <li
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  router.push(`${ROUTES.PROPERTIES}?hasVirtualTour=true`);
                }}
                className="cs-paragraph text-[16px]! cursor-pointer p-3 rounded-xl px-4 font-medium text-red-500 bg-red-50/50 hover:bg-red-50 dark:bg-red-900/10 dark:hover:bg-red-900/20 transition-colors"
              >
                {t("virtualTours")}
              </li>
              <li
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  router.push(ROUTES.LEADERBOARD);
                }}
                className="cs-paragraph text-[16px]! cursor-pointer p-3 rounded-xl px-4 cs-outline-gray text-foreground hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                {t("findAgents")}
              </li>

              <div className="my-2 border-b border-gray-100"></div>

              {/* Mobile Auth Actions */}
              {isLoading ? (
                <div className="flex animate-pulse items-center justify-center p-4">
                  <div className="h-4 w-24 rounded bg-gray-200" />
                </div>
              ) : me?.data?.userId ? (
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-3 p-3 bg-muted rounded-xl mb-2">
                    <Icon.User className="w-10 h-10 rounded-full bg-foreground text-background p-2 shrink-0" />
                    <div className="flex flex-col">
                      <span className="font-semibold text-sm text-foreground">
                        {me?.data?.userId?.fullName}
                      </span>
                    </div>
                  </div>

                  {me.data.roleId.code === "AGENT" && (
                    <li className="cursor-pointer">
                      <Link
                        href={ROUTES.AGENT_DASHBOARD}
                        className="flex items-center gap-3 p-3 cs-outline-gray rounded-xl bg-foreground text-background"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <Icon.Briefcase className="w-5 h-5" />
                        <span>{t("agentSpace")}</span>
                      </Link>
                    </li>
                  )}
                  <li
                    className="flex items-center gap-3 p-3 cs-outline-gray rounded-xl cursor-pointer text-foreground"
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      router.push(ROUTES.PROFILE);
                    }}
                  >
                    <Icon.User className="w-5 h-5" />
                    <span>{t("profile")}</span>
                  </li>
                  <li
                    className="flex items-center gap-3 p-3 cs-outline-gray rounded-xl cursor-pointer text-foreground"
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      router.push(`${ROUTES.PROPERTIES}?tab=favorites`);
                    }}
                  >
                    <Heart className="w-5 h-5 text-muted-foreground" />
                    <span>{t("myFavorites")}</span>
                  </li>
                  <li
                    className="flex items-center gap-3 p-3 cs-outline-gray rounded-xl cursor-pointer text-foreground"
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      router.push(ROUTES.SETTINGS);
                    }}
                  >
                    <Icon.Settings className="w-5 h-5" />
                    <span>{t("settings")}</span>
                  </li>
                  <li
                    className="flex items-center gap-3 p-3 border border-destructive/20 text-destructive rounded-xl cursor-pointer mt-2 bg-destructive/10 hover:bg-destructive/20 transition-colors"
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
                  className="flex justify-center items-center rounded-xl bg-foreground text-background p-3 mt-2 cursor-pointer transition-transform hover:scale-[0.98]"
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
