export const ReviewModerationEndpoint = {
  GetQueue: () => "/reviews/admin/queue",
  Approve: (reviewId: string) => `/reviews/admin/${reviewId}/approve`,
  Reject: (reviewId: string) => `/reviews/admin/${reviewId}/reject`,
} as const;

export const ReviewModerationQueryKey = {
  GetQueue: "GetReviewModerationQueue",
} as const;
