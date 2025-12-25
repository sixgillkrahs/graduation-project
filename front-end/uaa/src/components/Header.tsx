import EnglandFlag from "@/assets/images/icons/EnglandFlag.svg";
import VietNamFlag from "@/assets/images/icons/VietNamFlag.svg";
import { useGetMe } from "@/hooks/useMe";
import { Avatar, Badge, Dropdown, Select } from "antd";
import { Bell, Menu } from "lucide-react";
import { useTranslation } from "react-i18next";

const Header = ({
  isMenuOpen,
  setIsMenuOpen,
}: {
  isMenuOpen: boolean;
  setIsMenuOpen: (isOpen: boolean) => void;
}) => {
  const { i18n } = useTranslation();
  const currentLang = i18n.language?.startsWith("vi") ? "vi" : "en";
  const { data: me } = useGetMe();

  return (
    <div className="flex h-[70px] items-center justify-between bg-white px-[31px] py-[13px]">
      <div className="cursor-pointer">
        <Menu onClick={() => setIsMenuOpen(!isMenuOpen)} />
      </div>
      <div className="flex items-center gap-6">
        <Badge color="danger" content="3">
          <Bell />
        </Badge>
        <Select
          value={currentLang}
          style={{ width: 120 }}
          onChange={(value) => {
            i18n.changeLanguage(value);
          }}
          options={[
            {
              value: "vi",
              label: (
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <img src={VietNamFlag} alt="VN" width={20} />
                  <span>VI</span>
                </div>
              ),
            },
            {
              value: "en",
              label: (
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <img src={EnglandFlag} alt="EN" width={20} />
                  <span>EN</span>
                </div>
              ),
            },
          ]}
        />
        <Dropdown>
          <Avatar>{me?.data?.user?.fullName}</Avatar>
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
