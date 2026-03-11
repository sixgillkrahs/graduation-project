export const ReviewInvitationEndpoint = {
  getInvitation: (token: string) => `/reviews/invitations/${token}`,
  createReview: () => `/reviews`,
};

export const ReviewInvitationKey = {
  getInvitation: "getReviewInvitation",
};
