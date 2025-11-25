import MainLayout from "@/layouts/MainLayout";
import UserManageLayout from "@/layouts/UserManageLayout";
import { type RouterConfig } from "@shared/types/router";
import { lazy } from "react";

const router: RouterConfig = {
  path: "app",
  component: MainLayout,
  childRoutes: [
    {
      path: "/user-manage",
      component: UserManageLayout,
      childRoutes: [
        {
          path: "/resources",
          component: lazy(() => import("./user-manage/resources")),
        },
      ],
    },
  ],
};

export default router;
