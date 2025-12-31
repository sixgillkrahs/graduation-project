"use client";

import Logo from "@/assets/Logo.svg";
import Image from "next/image";
import { Button, Icon } from "../ui";
import { useRouter } from "next/navigation";
import { useState } from "react";

const Header = () => {
  const navigate = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogin = () => {
    navigate.push("/sign-in");
  };

  return (
    <header className="flex justify-between items-center bg-[#ffffff] px-4 md:px-20 container mx-auto py-4">
      <div className="flex items-center justify-between w-full md:w-auto">
        <div
          className="flex items-start gap-2 text-xl md:text-2xl font-semibold cursor-pointer"
          onClick={() => navigate.push("/")}
        >
          <Image src={Logo} alt="logo" width={24} height={24} />
          <span className="text-[#222222]">Havenly</span>
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
      <div className="hidden md:flex items-center rounded-full cs-outline-gray">
        <Icon.User className="bg-black w-full h-full p-2 rounded-full text-white" />
        <Button type="button" className="text-black pl-2!">
          Login
        </Button>
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
                <Button
                  type="button"
                  className="text-black pl-2!"
                  onClick={handleLogin}
                >
                  Login
                </Button>
              </li>
            </ul>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
