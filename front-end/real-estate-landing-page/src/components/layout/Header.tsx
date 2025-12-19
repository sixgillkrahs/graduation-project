import Logo from "@/assets/Logo.svg";
import Image from "next/image";
import { Button, Icon } from "../ui";

const Header = () => {
  return (
    <header className="flex justify-between items-center bg-[#ffffff] px-20 container mx-auto">
      <div className=" flex items-center justify-center gap-25">
        <div className="flex items-start gap-2 text-2xl font-semibold">
          <Image src={Logo} alt="logo" width={24} height={24} />
          <span className="text-[#222222]">Havenly</span>
        </div>
        <nav>
          <ul className="flex gap-6 p-6 ">
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
      </div>
      <div className="flex items-center rounded-full  cs-outline-gray">
        <Icon.User className="bg-black w-full h-full p-2 rounded-full text-white" />
        <Button type="button" className="text-black pl-2!">
          Login
        </Button>
      </div>
    </header>
  );
};

export default Header;
