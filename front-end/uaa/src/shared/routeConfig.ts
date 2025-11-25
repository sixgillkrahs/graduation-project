import type { RouterConfig } from "./types/router";
import NotFoundPage from "@/404";
import appRoute from "@/features/app/route";
import authRoute from "@/features/auth/route";
import { BlankLayout } from "@/layouts/BlankLayout";
import _ from "lodash";

const childRoutes: any = [authRoute, appRoute];

function isRouterConfig(route: any): route is RouterConfig {
  return (
    typeof route.path === "string" &&
    (!!route.component || (route.childRoutes && route.childRoutes.length > 0))
  );
}

const routes: RouterConfig[] = [
  {
    path: "/",
    component: BlankLayout,
    childRoutes: [
      ...childRoutes,
      { path: "*", name: "Page not found", component: NotFoundPage, hideInMenu: true },
    ].filter(isRouterConfig),
  },
];

function handleIndexRoute(route: RouterConfig) {
  if (!route.childRoutes || !route.childRoutes.length) {
    return;
  }

  const indexRoute: any = _.find(route.childRoutes, (child) => child.isIndex);
  if (indexRoute) {
    const first = { ...indexRoute };
    first.path = "";
    first.exact = true;
    first.autoIndexRoute = true;
    route.childRoutes.unshift(first);
  }
  route.childRoutes.forEach(handleIndexRoute);
}

routes.forEach(handleIndexRoute);

export default routes;
