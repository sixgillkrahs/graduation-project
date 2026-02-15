"use client";

import Logo from "@/assets/Logo.svg";
import { queryClient } from "@/lib/react-query/queryClient";
import AuthService from "@/shared/auth/AuthService";
import { useGetMe } from "@/shared/auth/query";
import { useLogout } from "@/shared/auth/mutate";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { CsButton } from "../custom";
import { Dropdown, DropdownItem, Icon } from "../ui";

const Header = () => {
  const { data: me, isLoading, isError, isSuccess } = useGetMe();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { mutateAsync: logout } = useLogout();

  useEffect(() => {
    if (isSuccess && me?.data) {
      localStorage.setItem("isLoggedIn", "true");
    } else if (isError) {
      localStorage.setItem("isLoggedIn", "false");
    }
  }, [isSuccess, isError, me]);

  const handleLogin = () => {
    router.push("/sign-in");
  };

  const handleLogout = async () => {
    await logout();
    localStorage.setItem("isLoggedIn", "false");
    router.refresh();
  };

  return (
    <header className="flex justify-between items-center bg-[#ffffff] px-4 md:px-20 container mx-auto py-4">
      <div className="flex items-center justify-between w-full md:w-auto">
        <div
          className="flex items-start gap-2 text-xl md:text-2xl font-semibold cursor-pointer"
          onClick={() => router.push("/")}
        >
          <Image src={Logo} alt="logo" width={24} height={24} />
          <span className="text-black">Havenly</span>
        </div>
        <nav className="hidden md:block">
          <ul className="flex gap-6 p-6">
            <li className="cs-typography text-[16px]! cursor-pointer flex items-center gap-1 cs-outline-gray p-2 rounded-full px-4">
              Search for properties <Icon.ArrowDown />
            </li>
            <li className="cs-paragraph text-[16px]! cursor-pointer p-2 rounded-full px-4  cs-outline-gray">
              List for sale
            </li>
            <li className="cs-paragraph text-[16px]! cursor-pointer p-2 rounded-full px-4  cs-outline-gray">
              List for rent
            </li>
            <li className="cs-paragraph text-[16px]! cursor-pointer p-2 rounded-full  cs-outline-gray size-[40px] ">
              <Icon.ExpandUpDown />
            </li>
          </ul>
        </nav>
        <div className="md:hidden">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 focus:outline-none"
          >
            <div className="w-6 h-6 flex flex-col justify-center items-center">
              <span
                className={`block w-5 h-0.5 bg-black transition-transform duration-300 ${
                  isMobileMenuOpen
                    ? "rotate-45 translate-y-1"
                    : "-translate-y-1"
                }`}
              ></span>
              <span
                className={`block w-5 h-0.5 bg-black transition-opacity duration-300 ${
                  isMobileMenuOpen ? "opacity-0" : "opacity-100"
                }`}
              ></span>
              <span
                className={`block w-5 h-0.5 bg-black transition-transform duration-300 ${
                  isMobileMenuOpen
                    ? "-rotate-45 -translate-y-1"
                    : "translate-y-1"
                }`}
              ></span>
            </div>
          </button>
        </div>
      </div>
      <div className="min-w-[180px] flex justify-end">
        {isLoading ? (
          <div className="hidden md:inline-flex items-center gap-2 rounded-full px-3 py-1 cs-outline-gray animate-pulse">
            <div className="h-4 w-24 rounded bg-gray-200" />
            <div className="w-8 h-8 rounded-full bg-gray-300" />
          </div>
        ) : me?.data?.userId ? (
          <div className="hidden md:flex items-center gap-2">
            {me.data.roleId.code === "AGENT" && (
              <Link href="/agent/dashboard">
                <CsButton
                  className="cs-bg-black text-white rounded-full"
                  icon={<Icon.Briefcase />}
                >
                  Agent space
                </CsButton>
              </Link>
            )}
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
                onClick={() => router.push(`/profile`)}
                icon={<Icon.User className="w-4 h-4" />}
              >
                Profile
              </DropdownItem>
              <DropdownItem
                onClick={() => router.push("/settings")}
                icon={<Icon.Settings className="w-4 h-4" />}
              >
                Settings
              </DropdownItem>
              <div className="my-1 border-t border-gray-200" />
              <DropdownItem
                danger
                onClick={handleLogout}
                icon={<Icon.LogoutCircle className="w-4 h-4" />}
              >
                Logout
              </DropdownItem>
            </Dropdown>
          </div>
        ) : (
          <div className="hidden md:flex items-center rounded-full cs-outline-gray px-3 py-1 gap-2 w-35!">
            <Icon.User className="bg-black w-8 h-8 p-1.5 rounded-full text-white" />
            <CsButton
              type="button"
              className="bg-white! outline-none! border-none! shadow-none! text-black"
              onClick={handleLogin}
            >
              Login
            </CsButton>
          </div>
        )}
      </div>
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-white shadow-lg z-50">
          <nav className="px-4 py-4">
            <ul className="flex flex-col gap-4">
              <li className="cs-typography text-[16px]! cursor-pointer flex items-center gap-1 cs-outline-gray p-2 rounded-full px-4">
                Search for properties <Icon.ArrowDown />
              </li>
              <li className="cs-paragraph text-[16px]! cursor-pointer p-2 rounded-full px-4  cs-outline-gray">
                List for sale
              </li>
              <li className="cs-paragraph text-[16px]! cursor-pointer p-2 rounded-full px-4  cs-outline-gray">
                List for rent
              </li>
              <li className="cs-paragraph text-[16px]! cursor-pointer p-2 rounded-full  cs-outline-gray size-[40px] ">
                <Icon.ExpandUpDown />
              </li>
              <li className="flex items-center rounded-full cs-outline-gray mt-4">
                <Icon.User className="bg-black w-full h-full p-2 rounded-full text-white" />
                <CsButton
                  type="button"
                  className="text-black pl-2!"
                  onClick={() => handleLogin()}
                >
                  Login
                </CsButton>
              </li>
            </ul>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
