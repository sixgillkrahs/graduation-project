import logo from "@/assets/logo.svg";
import routes from "@/shared/routeConfig";
import { Image } from "antd";
import React, { type ComponentType } from "react";
import { useTranslation } from "react-i18next";
import { NavLink } from "react-router-dom";

const MenuItem = ({ to, icon, text }: { to: string; icon?: ComponentType<any>; text: string }) => (
  <NavLink to={to} end className="flex items-center gap-2">
    {({ isActive }) => (
      <>
        <div
          className={`h-[50px] w-2 rounded-r-[4px] transition-all duration-300 ease-out ${
            isActive ? "scale-y-100 bg-[#4880FF]" : "scale-y-50 bg-transparent opacity-0"
          }`}
        ></div>
        <div
          className={`mx-4 flex w-full transform items-center gap-2 rounded-md p-[13px] transition-all duration-300 ease-out ${
            isActive
              ? "scale-[1.02] bg-[#4880FF] text-white shadow-lg"
              : "bg-white text-black hover:scale-[1.01] hover:bg-gray-50 hover:shadow-md"
          }`}
        >
          {icon && (
            <div
              className={`transition-transform duration-300 ${isActive ? "scale-110" : "scale-100"}`}
            >
              {React.createElement(icon)}
            </div>
          )}
          <span className="text-[14px] font-medium transition-all duration-300">{text}</span>
        </div>
      </>
    )}
  </NavLink>
);

const filterMenuRoutes = (routes: any[]): any[] => {
  return routes
    .filter((route) => !route.hideInMenu)
    .map((route) => {
      const result: any = {};

      if (route.name) {
        result.name = route.name;
      }
      if (route.path) {
        result.path = route.path;
      }
      if (route.icon) {
        result.icon = route.icon;
      }

      if (route.childRoutes && route.childRoutes.length > 0) {
        result.children = filterMenuRoutes(route.childRoutes);

        if (result.children.length === 0) {
          delete result.children;
        }
      }

      if (result.name || result.children) {
        return result;
      }

      return null;
    })
    .filter(Boolean);
};

const Menu = ({ isOpen }: { isOpen: boolean }) => {
  const { t } = useTranslation();
  const root = routes[0].childRoutes;
  const menuItems = filterMenuRoutes(root!)[0]?.children;

  return (
    <div
      className={`h-full ${isOpen ? "w-60 translate-x-0" : "w-0 -translate-x-full"} overflow-hidden transition-all duration-500 ease-out`}
    >
      <div className="flex flex-col">
        <div className="flex h-16 items-center justify-center gap-2">
          <Image
            src={logo}
            alt="logo"
            className="h-6 w-auto transition-transform duration-500 hover:scale-110"
          />
          <span className="text-2xl font-bold text-[#1890FF] transition-all duration-300 hover:tracking-wider">
            UAA
          </span>
        </div>

        <div className="flex flex-col gap-2 py-2">
          {menuItems.map((item: any, index: number) => (
            <div
              key={item.path}
              className="transition-all duration-500 ease-out"
              style={{
                animationDelay: `${index * 100}ms`,
              }}
            >
              <MenuItem to={item.path} icon={item.icon} text={t(item.name)} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Menu;
