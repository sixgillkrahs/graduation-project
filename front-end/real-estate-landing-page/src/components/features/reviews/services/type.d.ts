namespace IReviewService {
  export type ReviewStatus =
    | "PENDING"
    | "AWAITING_ADMIN"
    | "PUBLISHED"
    | "REJECTED"
    | "REPORTED";
  export type ReviewAutoReplyStatus =
    | "IDLE"
    | "GENERATING"
    | "READY"
    | "APPLIED"
    | "FAILED"
    | "DISCARDED";
  export type ReviewFilter = "all" | "5star" | "1-3star" | "unanswered";

  export interface ReviewReply {
    content: string;
    repliedAt?: string;
  }

  export interface ReviewAutoReply {
    draft: string;
    status: ReviewAutoReplyStatus;
    generatedAt?: string;
    appliedAt?: string;
    error?: string;
  }

  export interface ReviewItem {
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
    autoReply: ReviewAutoReply | null;
  }

  export interface PublicSummary {
    averageRating: number;
    totalReviews: number;
    breakdown: Array<{
      star: number;
      count: number;
    }>;
  }

  export interface PublicListResponse {
    results: ReviewItem[];
    totalPages: number;
    totalResults: number;
    page: number;
    limit: number;
    summary: PublicSummary;
  }

  export interface AgentSummary {
    averageRating: number;
    totalReviews: number;
    pendingCount: number;
    reportedCount: number;
    unansweredCount: number;
  }

  export interface AgentListResponse {
    results: ReviewItem[];
    totalPages: number;
    totalResults: number;
    page: number;
    limit: number;
    summary: AgentSummary;
  }

  export interface GetPublicParams {
    page?: number;
    limit?: number;
  }

  export interface GetMyParams {
    page?: number;
    limit?: number;
    search?: string;
    filter?: ReviewFilter;
  }

  export interface ReplyPayload {
    reviewId: string;
    reply: string;
  }

  export interface ReportPayload {
    reviewId: string;
    reason?: string;
  }

  export interface GenerateAutoReplyPayload {
    reviewId: string;
  }

  export interface ApplyAutoReplyPayload {
    reviewId: string;
    reply?: string;
  }

  export interface DiscardAutoReplyPayload {
    reviewId: string;
  }
}
