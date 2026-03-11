namespace IReviewModerationService {
  type ReviewStatus = "PENDING" | "AWAITING_ADMIN" | "PUBLISHED" | "REJECTED" | "REPORTED";

  interface ReviewReply {
    content: string;
    repliedAt?: string;
  }

  interface ReviewDTO {
    id: string;
    rating: number;
    tags: string[];
    comment: string;
    propertyName: string;
    customerName: string;
    customerInitial: string;
    createdAt?: string;
    status: ReviewStatus;
    agentReply: ReviewReply | null;
    reportedAt?: string;
    reportReason?: string;
    adminNote?: string;
  }
}
