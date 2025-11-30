import { Badge, Dropdown } from "antd";
import { Bell, Menu } from "lucide-react";

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
        <Dropdown>
          {/* <DropdownTrigger>
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
          </DropdownMenu> */}
        </Dropdown>
      </div>
    </div>
  );
};

export default Header;
