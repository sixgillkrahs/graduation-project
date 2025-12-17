import React from "react";
import { Icon } from "../ui/Icon/Icon";
import Button from "../ui/Button";

const Header = () => {
  return (
    <header className="flex justify-between items-center bg-[#ffffff] px-5">
      <div className="text-2xl font-bold">ProPerTy12</div>
      <div>
        <nav>
          <ul className="flex gap-6 p-6 ">
            <li className="text-[#7f8b89] cursor-pointer">Buy</li>
            <li className="text-[#7f8b89] cursor-pointer">Rent</li>
            <li className="text-[#7f8b89] cursor-pointer">Sold</li>
          </ul>
        </nav>
      </div>
      <div className="flex items-center gap-4">
        <Button type="button" className="bg-white ">
          SignIn
        </Button>
        <Button outline type="button" className="bg-white text-black ">
          Register
        </Button>
      </div>
    </header>
  );
};

export default Header;
