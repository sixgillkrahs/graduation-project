import logo from "@/assets/logo.svg";
import routes from "@/shared/routeConfig";
import { Image } from "antd";
import { ChevronDown, ChevronRight } from "lucide-react";
import React, { useState, type ComponentType } from "react";
import { useTranslation } from "react-i18next";
import { NavLink, useLocation } from "react-router-dom";

const MenuItem = ({
  to,
  icon,
  text,
  className,
  isChild = false,
}: {
  to: string;
  icon?: ComponentType<any>;
  text: string;
  className?: string;
  isChild?: boolean;
}) => (
  <NavLink to={to} end className={`flex items-center gap-2 ${className}`}>
    {({ isActive }) => (
      <>
        <div
          className={`h-[50px] w-2 rounded-r-[4px] transition-all duration-300 ease-out ${
            isActive
              ? `scale-y-100 ${!isChild ? "bg-[#4880FF]" : ""}`
              : "scale-y-50 bg-transparent opacity-0"
          }`}
        ></div>

        <div
          className={`mr-4 flex w-full transform items-center gap-2 rounded-md p-[13px] transition-all duration-300 ease-out ${
            isActive
              ? "scale-[1.02] bg-[#4880FF] text-white shadow-lg"
              : "bg-white text-black hover:scale-[1.01] hover:bg-gray-50 hover:shadow-md"
          }`}
        >
          {icon && (
            <div
              className={`transition-transform duration-300 ${isActive ? "scale-110" : "scale-100"}`}
            >
              {React.createElement(icon, { size: 20 })}
            </div>
          )}
          <span className="text-[14px] font-medium whitespace-nowrap transition-all duration-300">
            {text}
          </span>
        </div>
      </>
    )}
  </NavLink>
);

const filterMenuRoutes = (routes: any[], parentPath: string = ""): any[] => {
  return routes
    .filter((route) => !route.hideInMenu)
    .map((route) => {
      const result: any = {};

      let fullPath = route.path;

      if (route.path) {
        if (parentPath) {
          const safeParentPath = parentPath.endsWith("/") ? parentPath.slice(0, -1) : parentPath;

          const safeRoutePath = route.path.startsWith("/") ? route.path : `/${route.path}`;

          fullPath = `${safeParentPath}${safeRoutePath}`;
        } else {
          fullPath = route.path.startsWith("/") ? route.path : `/${route.path}`;
        }
      }

      if (route.name) {
        result.name = route.name;
      }

      if (fullPath) {
        result.path = fullPath;
      }

      if (route.icon) {
        result.icon = route.icon;
      }

      if (route.childRoutes && route.childRoutes.length > 0) {
        result.children = filterMenuRoutes(route.childRoutes, fullPath || parentPath);

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
  const location = useLocation();
  const root = routes[0].childRoutes;
  const menuItems = filterMenuRoutes(root!)[0]?.children;

  const [openKeys, setOpenKeys] = useState<Record<string, boolean>>({});

  const toggleSubMenu = (path: string) => {
    setOpenKeys((prev) => ({ ...prev, [path]: !prev[path] }));
  };

  console.log(menuItems);

  return (
    <div
      className={`h-full ${
        isOpen ? "w-60 translate-x-0" : "w-0 -translate-x-full"
      } overflow-hidden bg-white transition-all duration-500 ease-out`}
    >
      <div className="flex w-60 flex-col">
        <div className="flex h-16 items-center justify-center gap-2">
          <Image
            src={logo}
            alt="logo"
            preview={false}
            className="h-6 w-auto object-contain transition-transform duration-500 hover:scale-110"
          />
          <span className="text-2xl font-bold whitespace-nowrap text-[#1890FF] transition-all duration-300 hover:tracking-wider">
            UAA
          </span>
        </div>

        <div className="flex max-h-[calc(100vh-64px)] flex-col gap-2 overflow-y-auto py-2">
          {menuItems.map((item: any, index: number) => {
            const hasChildren = item.children && item.children.length > 0;
            const isOpenSub = openKeys[item.path];

            const isActiveParent = item.children?.some(
              (child: any) => location.pathname === child.path,
            );

            if (hasChildren) {
              return (
                <div key={item.path} className="flex flex-col">
                  <div
                    onClick={() => toggleSubMenu(item.path)}
                    className="group flex cursor-pointer items-center gap-2"
                  >
                    <div
                      className={`h-[50px] w-2 rounded-r-[4px] transition-all duration-300 ${
                        isActiveParent ? "scale-y-100 bg-[#4880FF]" : "scale-y-50 bg-transparent"
                      }`}
                    ></div>

                    <div
                      className={`mr-4 flex w-full items-center justify-between rounded-md p-[13px] transition-all duration-300 ${
                        isActiveParent
                          ? "bg-blue-50 font-medium text-[#4880FF] shadow-sm"
                          : "bg-white text-black hover:bg-gray-50 hover:shadow-md"
                      } `}
                    >
                      <div className="flex items-center gap-2">
                        {item.icon && (
                          <div
                            className={`transition-transform duration-300 ${isActiveParent ? "scale-110" : "scale-100"}`}
                          >
                            {React.createElement(item.icon, { size: 20 })}
                          </div>
                        )}
                        <span className="text-[14px] whitespace-nowrap">{t(item.name)}</span>
                      </div>

                      {isOpenSub ? (
                        <ChevronDown
                          size={16}
                          className={isActiveParent ? "text-[#4880FF]" : "text-gray-500"}
                        />
                      ) : (
                        <ChevronRight
                          size={16}
                          className={isActiveParent ? "text-[#4880FF]" : "text-gray-500"}
                        />
                      )}
                    </div>
                  </div>

                  <div
                    className={`overflow-hidden transition-all duration-300 ease-in-out ${
                      isOpenSub ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
                    }`}
                  >
                    {item.children.map((child: any) => (
                      <MenuItem
                        key={child.path}
                        to={child.path}
                        icon={child.icon}
                        text={t(child.name)}
                        className="pl-4"
                        isChild={true}
                      />
                    ))}
                  </div>
                </div>
              );
            }

            return (
              <div
                key={item.path}
                className="transition-all duration-500 ease-out"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <MenuItem to={item.path} icon={item.icon} text={t(item.name)} />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Menu;
