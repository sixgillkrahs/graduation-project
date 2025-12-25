import AuthLayout from "@/layouts/AuthLayout";
import { type RouterConfig } from "@shared/types/router";
import { lazy } from "react";

const router: RouterConfig = {
  path: "auth",
  component: AuthLayout,
  hideInMenu: true,
  childRoutes: [
    {
      path: "/sign-in",
      component: lazy(() => import("./signin")),
    },
    {
      path: "/sign-up",
      component: lazy(() => import("./signup")),
    },
  ],
};

export default router;
