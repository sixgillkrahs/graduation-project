import Header from "@/components/Header";
import Menu from "@/components/Menu";
import { useGetMe } from "@shared/auth/query";
import { Spin } from "antd";
import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";

const MainLayout = () => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(true);
  const location = useLocation();
  const { isPending, isError } = useGetMe();

  if (isPending) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#F2F2F2]">
        <Spin size="large" />
      </div>
    );
  }

  if (isError) {
    return (
      <Navigate
        to="/auth/sign-in"
        replace
        state={{
          from: location,
        }}
      />
    );
  }

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
