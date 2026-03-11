namespace IReviewInvitationService {
  export interface InvitationDTO {
    agentName: string;
    propertyName: string;
    customerName: string;
    expiresAt: string;
    quickTags: string[];
  }

  export interface CreateReviewPayload {
    token: string;
    rating: number;
    tags: string[];
    comment?: string;
  }

  export interface CreateReviewResponse {
    id: string;
    rating: number;
    tags: string[];
    comment: string;
    status:
      | "PENDING"
      | "AWAITING_ADMIN"
      | "PUBLISHED"
      | "REJECTED"
      | "REPORTED";
  }
}
