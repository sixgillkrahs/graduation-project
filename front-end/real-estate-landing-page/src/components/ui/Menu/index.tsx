import React from "react";
import clsx from "clsx";
import { MenuItem } from "./menu.types";
import Link from "next/link";

interface MenuProps {
  items: MenuItem[];
  selectedKey?: string;
  onSelect?: (key: string) => void;
  className?: string;
  collapsed?: boolean;
}

export const Menu: React.FC<MenuProps> = ({
  items,
  selectedKey,
  onSelect,
  className,
  collapsed,
}) => {
  return (
    <nav
      className={clsx(
        "flex-1 overflow-y-auto py-6 px-3 flex flex-col gap-1",
        className
      )}
    >
      {items.map((item) => {
        const isActive = item.key === selectedKey;

        return (
          <Link
            key={item.key}
            href={item.href ?? "#"}
            onClick={() => onSelect?.(item.key)}
            className={clsx(
              "flex items-center gap-3 px-3 py-3 rounded-2xl transition-all group",
              isActive
                ? "bg-[#77777A] text-white border border-primary"
                : "text-black hover:bg-white/5 hover:text-[#77777A]",
              collapsed ? "justify-center" : ""
            )}
          >
            <span
              className={clsx(
                "material-symbols-outlined transition-colors",
                !isActive && "group-hover:text-primary"
              )}
              style={{ fontSize: 22 }}
            >
              {item.icon}
            </span>

            {!collapsed && (
              <span
                className={clsx(
                  "text-sm whitespace-nowrap",
                  isActive ? "font-semibold" : "font-medium"
                )}
              >
                {item.label}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
};
