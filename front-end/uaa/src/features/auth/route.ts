import AuthLayout from "@/layouts/AuthLayout";
import { type RouterConfig } from "@shared/types/router";
import { lazy } from "react";

const router: RouterConfig = {
  path: "auth",
  component: AuthLayout,
  childRoutes: [
    {
      path: "/sign-in",
      component: lazy(() => import("./signin")),
    },
  ],
};

export default router;
