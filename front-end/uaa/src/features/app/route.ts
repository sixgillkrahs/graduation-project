import MainLayout from "@/layouts/MainLayout";
import { type RouterConfig } from "@shared/types/router";
import { Settings, Users } from "lucide-react";
import { lazy } from "react";

const router: RouterConfig = {
  path: "",
  component: MainLayout,
  childRoutes: [
    {
      path: "/user-manage",
      component: lazy(() => import("./user-manage")),
      name: "User Management",
      icon: Users,
      // childRoutes: [
      //   {
      //     path: "/resources",
      //     component: lazy(() => import("./user-manage/resources")),
      //     name: "Resources",
      //   },
      // ],
    },
    {
      path: "/setting",
      component: lazy(() => import("./settings/setting")),
      name: "Setting",
      icon: Settings,
    },
  ],
};

export default router;
