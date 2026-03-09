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
  revenueSummary: (currency: string) =>
    `/agents/me/revenue-summary?currency=${currency}`,
  salesLog: (currency: string, limit = 5) =>
    `/agents/me/sales-log?currency=${currency}&limit=${limit}`,
  revenueLeaderboard: (currency: string, limit = 10) =>
    `/agents/revenue-leaderboard?currency=${currency}&limit=${limit}`,
} as const;

export const DashboardQueryKey = {
  countPropertiesByAgent: "countPropertiesByAgent",
  countTotalView: "countTotalView",
  countSoldPropertiesByAgent: "countSoldPropertiesByAgent",
  getSchedulesToday: "getSchedulesToday",
  analytics: "analytics",
  revenueSummary: "revenueSummary",
  salesLog: "salesLog",
  revenueLeaderboard: "revenueLeaderboard",
} as const;
