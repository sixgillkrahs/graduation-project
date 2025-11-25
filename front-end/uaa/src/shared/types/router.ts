import type { ComponentType, ReactNode } from "react";

export interface RouterConfig {
  path: string;
  name?: string;
  icon?: ReactNode;
  component?: ComponentType<any>;
  childRoutes?: RouterConfig[];
  isIndex?: true;
}
