import type { ComponentType } from "react";

export interface RouterConfig {
  path: string;
  name?: string;
  icon?: ComponentType<any>;
  component?: ComponentType<any>;
  childRoutes?: RouterConfig[];
  isIndex?: true;
  hideInMenu?: boolean
}
