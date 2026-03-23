import EnglandFlag from "@/assets/images/icons/EnglandFlag.svg";
import VietNamFlag from "@/assets/images/icons/VietNamFlag.svg";
import { useLogout } from "@shared/auth/mutation";
import { useGetMe } from "@shared/auth/query";
import { Avatar, Badge, Dropdown, Select } from "antd";
import { Bell, ChevronDown, LogOut, Menu } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

const LangOptions = [
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
];

const Header = ({
  isMenuOpen,
  setIsMenuOpen,
}: {
  isMenuOpen: boolean;
  setIsMenuOpen: (isOpen: boolean) => void;
}) => {
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const currentLang = i18n.language?.startsWith("vi") ? "vi" : "en";
  const { data: me } = useGetMe();
  const { mutateAsync: logout, isPending: isLoggingOut } = useLogout();
  const fullName = me?.data?.user?.fullName?.trim() || "User";
  const avatarFallback = fullName
    .split(" ")
    .filter(Boolean)
    .map((item) => item[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const handleLogout = async () => {
    try {
      await logout();
    } catch {
      // Redirect even if the logout request fails so the local app session is closed.
    } finally {
      navigate("/auth/sign-in", { replace: true });
    }
  };

  const userMenuItems = [
    {
      key: "logout",
      label: "Logout",
      icon: <LogOut className="h-4 w-4" />,
      disabled: isLoggingOut,
      onClick: handleLogout,
    },
  ];

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
          options={LangOptions}
        />
        <Dropdown menu={{ items: userMenuItems }} trigger={["click"]}>
          <button
            type="button"
            className="flex items-center gap-3 rounded-full border border-gray-200 bg-white px-2 py-1 transition-colors hover:border-gray-300"
            disabled={isLoggingOut}
          >
            <Avatar>{avatarFallback}</Avatar>
            <div className="hidden text-left md:block">
              <div className="text-sm font-medium text-gray-900">{fullName}</div>
              <div className="text-xs text-gray-500">{me?.data?.user?.email}</div>
            </div>
            <ChevronDown className="h-4 w-4 text-gray-500" />
          </button>
        </Dropdown>
      </div>
    </div>
  );
};

export default Header;
