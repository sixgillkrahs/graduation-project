import { Outlet } from "react-router-dom";

const UserManageLayout = () => {
  return (
    <div className="min-h-screen min-w-dvh">
      <h1 className="text-black-900 text-3xl font-bold">User Manage</h1>
      <Outlet />
    </div>
  );
};

export default UserManageLayout;
