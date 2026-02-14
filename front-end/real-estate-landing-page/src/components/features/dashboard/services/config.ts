export const DashboardEndpoint = {
  countPropertiesByAgent: (period?: string) =>
    `/agents/me/properties/count?period=${period}`,
  countTotalView: (period?: string) =>
    `/agents/me/properties/count-view?period=${period}`,
  countSoldPropertiesByAgent: (period?: string) =>
    `/agents/me/properties/count-sold?period=${period}`,
  getSchedulesToday: () => "/schedules/me",
  analytics: (period?: string) =>
    `/agents/me/analytics?period=${period || "month"}`,
} as const;

export const DashboardQueryKey = {
  countPropertiesByAgent: "countPropertiesByAgent",
  countTotalView: "countTotalView",
  countSoldPropertiesByAgent: "countSoldPropertiesByAgent",
  getSchedulesToday: "getSchedulesToday",
  analytics: "analytics",
} as const;
