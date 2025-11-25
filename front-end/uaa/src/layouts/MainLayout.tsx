import Menu from "@/components/Menu";
import { Outlet } from "react-router-dom";

const MainLayout = () => {
  return (
    <div className="border-8 border-[#606060]">
      <div className="rounded-[10px]">
        <div className="flex">
          <div>
            <Menu />
          </div>
          <div>
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainLayout;
