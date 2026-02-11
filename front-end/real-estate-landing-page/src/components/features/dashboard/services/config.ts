export const DashboardEndpoint = {
  countPropertiesByAgent: () => `/agents/me/properties/count`,
} as const;

export const DashboardQueryKey = {
  countPropertiesByAgent: "countPropertiesByAgent",
} as const;
