export const ReportInboxEndpoint = {
  list: () => "/notices/me",
  markAsRead: (id: string) => `/notices/${id}/read`,
} as const;

export const ReportInboxQueryKey = {
  list: "ReportInboxList",
} as const;
