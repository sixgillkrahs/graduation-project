import Header from "@/components/Header";
import Menu from "@/components/Menu";
import React from "react";
import { Outlet } from "react-router-dom";

const MainLayout = () => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  return (
    <div className="flex h-screen">
      <div className="relative">
        <Menu isOpen={isMenuOpen} />
      </div>
      <div className="flex flex-1 flex-col">
        <Header isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />
        <div className="box-content flex-1 bg-[#F2F2F2] p-[31px] shadow-md">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default MainLayout;
