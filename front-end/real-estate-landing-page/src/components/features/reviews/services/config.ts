export const ReviewsEndpoint = {
  getPublicByAgent: (agentUserId: string) => `/reviews/agents/${agentUserId}/public`,
  getMyReviews: () => "/reviews/me",
  generateAutoReply: (reviewId: string) =>
    `/reviews/${reviewId}/auto-reply/generate`,
  applyAutoReply: (reviewId: string) => `/reviews/${reviewId}/auto-reply/apply`,
  discardAutoReply: (reviewId: string) =>
    `/reviews/${reviewId}/auto-reply/discard`,
  reply: (reviewId: string) => `/reviews/${reviewId}/reply`,
  report: (reviewId: string) => `/reviews/${reviewId}/report`,
} as const;

export const ReviewsQueryKey = {
  publicList: "publicAgentReviews",
  myList: "myReviews",
} as const;
