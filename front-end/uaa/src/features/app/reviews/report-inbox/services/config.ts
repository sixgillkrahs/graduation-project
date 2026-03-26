export const ReportInboxEndpoint = {
  list: () => "/notices/me",
  markAsRead: (id: string) => `/notices/${id}/read`,
  detail: (id: string) => `/reports/${id}`,
  resolve: (id: string) => `/reports/${id}/resolve`,
} as const;

export const ReportInboxQueryKey = {
  list: "ReportInboxList",
  detail: "ReportInboxDetail",
} as const;
