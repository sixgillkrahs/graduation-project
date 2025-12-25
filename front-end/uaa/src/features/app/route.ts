import MainLayout from "@/layouts/MainLayout";
import { type RouterConfig } from "@shared/types/router";
import { Settings, Users, LayoutDashboard } from "lucide-react";
import { lazy } from "react";

const router: RouterConfig = {
  path: "",
  component: MainLayout,
  childRoutes: [
    {
      path: "/dashboard",
      name: "Dashboard",
      icon: LayoutDashboard,
      component: lazy(() => import("./dashboard")),
    },
    {
      path: "/agent",
      name: "Agent",
      icon: Users,
      childRoutes: [
        {
          path: "/agent-registration",
          component: lazy(() => import("./agents/agent-registration")),
          name: "Agent Registration",
        },
      ],
    },
    {
      path: "/user-manage",
      component: lazy(() => import("./user-manage")),
      name: "menu.user-management",
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
      name: "menu.setting",
      icon: Settings,
    },
  ],
};

export default router;
