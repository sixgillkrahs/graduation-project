import logo from "@/assets/logo.svg";
import { Image } from "@heroui/react";
import { CircleUserRound } from "lucide-react";

const Menu = () => {
  return (
    <div className="h-full w-60 bg-white">
      <div className="flex flex-col">
        <div className="flex h-16 items-center justify-center gap-2">
          <Image src={logo} alt="logo" className="h-6 w-auto" />
          <span className="text-2xl font-bold text-[#1890FF]">UAA</span>
        </div>
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <div className="h-full w-3 bg-[#4880FF]"></div>
            <div className="flex items-center gap-2 bg-[#4880FF] py-3">
              <CircleUserRound />
              <span className="text-[14px] font-semibold">User</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Menu;
