import MessageService from "@shared/message";
import routeConfig from "@shared/routeConfig";
import type { RouterConfig } from "@shared/types/router";
import { message, Spin } from "antd";
import { Suspense, useEffect } from "react";
import { Outlet, Route, Routes } from "react-router-dom";

function renderRouteConfig(
  routes: RouterConfig[],
  fallbackElement: React.ReactNode,
  contextPath = "",
) {
  const children: React.ReactNode[] = [];

  for (const item of routes) {
    let newPath = item.path.startsWith("/")
      ? item.path
      : `${contextPath}/${item.path}`.replace(/\/+/g, "/");

    newPath = newPath.replace(/\/$/, "") || "/";

    if (item.childRoutes && item.childRoutes.length > 0) {
      children.push(
        <Route
          key={newPath}
          path={newPath === "/" ? "/" : newPath.replace(/^\//, "")}
          element={
            item.component ? (
              <Suspense fallback={fallbackElement}>
                <item.component />
              </Suspense>
            ) : (
              <Outlet />
            )
          }
        >
          {renderRouteConfig(item.childRoutes, fallbackElement, newPath)}
        </Route>,
      );
    } else if (item.component) {
      children.push(
        <Route
          key={newPath}
          path={newPath === "/" ? "/" : newPath.replace(/^\//, "")}
          element={
            <Suspense fallback={fallbackElement}>
              <item.component />
            </Suspense>
          }
        />,
      );
    }
  }
  return children;
}

function App() {
  const [messageApi, contextHolder] = message.useMessage();

  useEffect(() => {
    MessageService.init(messageApi);
  }, [messageApi]);
  console.log(renderRouteConfig(routeConfig, <Spin fullscreen size="large" />));

  return (
    <>
      {contextHolder}
      <Routes>{renderRouteConfig(routeConfig, <Spin fullscreen size="large" />)}</Routes>
    </>
  );
}

export default App;
