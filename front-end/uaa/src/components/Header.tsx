import { Badge } from "@heroui/badge";
import { Dropdown, DropdownItem, DropdownMenu, DropdownTrigger } from "@heroui/dropdown";
import { User } from "@heroui/user";
import { Bell, Menu } from "lucide-react";
import React from "react";

const Header = ({
  isMenuOpen,
  setIsMenuOpen,
}: {
  isMenuOpen: boolean;
  setIsMenuOpen: (isOpen: boolean) => void;
}) => {
  return (
    <div className="flex h-[70px] items-center justify-between bg-white px-[31px] py-[13px]">
      <div className="cursor-pointer">
        <Menu onClick={() => setIsMenuOpen(!isMenuOpen)} />
      </div>
      <div className="flex items-center gap-6">
        <Badge color="danger" content="3">
          <Bell />
        </Badge>
        <Dropdown placement="bottom-end">
          <DropdownTrigger>
            <User
              as="button"
              avatarProps={{
                isBordered: true,
                src: "https://i.pravatar.cc/150?u=a042581f4e29026024d",
              }}
              className="gap-5 transition-transform"
              description="Admin"
              name="Quân Đỗ"
            />
          </DropdownTrigger>
          <DropdownMenu aria-label="Profile Actions" variant="flat">
            <DropdownItem key="logout" color="danger">
              Log Out
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </div>
    </div>
  );
};

export default Header;
