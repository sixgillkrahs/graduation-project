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
      path: "/agents",
      name: "Agent",
      icon: Users,
      childRoutes: [
        {
          path: "/registration",
          component: lazy(() => import("./agents/agent-registration/agent-registration")),
          name: "Agent Registration",
        },
        {
          path: "/registration/:id",
          component: lazy(() => import("./agents/agent-registration/agent-registration-detail")),
          name: "Agent Registration Detail",
          hideInMenu: true,
        },
        {
          path: "/manage",
          component: lazy(() => import("./agents/agent-manage")),
          name: "Agent Management",
        },
      ],
    },
    {
      path: "/properties",
      name: "Properties",
      icon: Users,
      childRoutes: [
        {
          path: "/pending",
          component: lazy(() => import("./properties/properties/properties-pending")),
          name: "Properties Pending",
        },
        {
          path: "/pending/:id",
          component: lazy(() => import("./properties/properties/properties-detail")),
          name: "Properties Detail",
          hideInMenu: true,
        },
        {
          path: "/rejected",
          component: lazy(() => import("./properties/properties/properties-rejected")),
          name: "Properties Rejected",
        },
        {
          path: "/rejected/:id",
          component: lazy(() => import("./properties/properties/properties-detail")),
          name: "Rejected Property Detail",
          hideInMenu: true,
        },
        {
          path: "/published",
          component: lazy(() => import("./properties/properties/properties-published")),
          name: "Properties Published",
        },
        {
          path: "/published/:id",
          component: lazy(() => import("./properties/properties/properties-detail")),
          name: "Published Property Detail",
          hideInMenu: true,
        },
      ],
    },
    {
      path: "/user-manage",
      component: lazy(() => import("./user-manage")),
      name: "menu.user-management",
      icon: Users,
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
