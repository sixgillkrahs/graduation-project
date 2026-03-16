import MainLayout from "@/layouts/MainLayout";
import { type RouterConfig } from "@shared/types/router";
import { Settings, LayoutDashboard, UserCog, Building2, Users, ListTodo, Star } from "lucide-react";
import { lazy } from "react";

const router: RouterConfig = {
  path: "",
  component: MainLayout,
  childRoutes: [
    {
      path: "/dashboard",
      name: "menu.dashboard",
      icon: LayoutDashboard,
      component: lazy(() => import("./dashboard")),
    },
    {
      path: "/agents",
      name: "menu.agent",
      icon: UserCog,
      childRoutes: [
        {
          path: "/registration",
          component: lazy(() => import("./agents/agent-registration/agent-registration")),
          name: "menu.agentRegistration",
        },
        {
          path: "/registration/:id",
          component: lazy(() => import("./agents/agent-registration/agent-registration-detail")),
          name: "menu.agentRegistrationDetail",
          hideInMenu: true,
        },
        {
          path: "/manage",
          component: lazy(() => import("./agents/agent-manage")),
          name: "menu.agentManage",
        },
      ],
    },
    {
      path: "/properties",
      name: "menu.properties",
      icon: Building2,
      childRoutes: [
        {
          path: "/pending",
          component: lazy(() => import("./properties/properties/properties-pending")),
          name: "menu.propertiesPending",
        },
        {
          path: "/pending/:id",
          component: lazy(() => import("./properties/properties/properties-detail")),
          name: "menu.propertiesDetail",
          hideInMenu: true,
        },
        {
          path: "/rejected",
          component: lazy(() => import("./properties/properties/properties-rejected")),
          name: "menu.propertiesRejected",
        },
        {
          path: "/rejected/:id",
          component: lazy(() => import("./properties/properties/properties-detail")),
          name: "menu.propertiesDetail",
          hideInMenu: true,
        },
        {
          path: "/published",
          component: lazy(() => import("./properties/properties/properties-published")),
          name: "menu.propertiesPublished",
        },
        {
          path: "/published/:id",
          component: lazy(() => import("./properties/properties/properties-detail")),
          name: "menu.propertiesDetail",
          hideInMenu: true,
        },
      ],
    },
    {
      path: "/reviews",
      name: "menu.reviews",
      icon: Star,
      childRoutes: [
        {
          path: "/moderation",
          component: lazy(() => import("./reviews/review-moderation")),
          name: "menu.reviewModeration",
        },
        {
          path: "/reports",
          component: lazy(() => import("./reviews/report-inbox")),
          name: "menu.reportInbox",
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
      path: "/jobs",
      component: lazy(() => import("./jobs")),
      name: "menu.jobs",
      icon: ListTodo,
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
