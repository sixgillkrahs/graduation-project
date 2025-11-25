import MainLayout from "@/layouts/MainLayout";
import { type RouterConfig } from "@shared/types/router";
import { lazy } from "react";
import { Settings, Users } from "lucide-react";


const router: RouterConfig = {
  path: "",
  component: MainLayout,
  childRoutes: [
    {
      path: "/user-manage",
      component: lazy(() => import("./user-manage/resources")),
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
      icon: Settings
    }
  ],
};

export default router;
