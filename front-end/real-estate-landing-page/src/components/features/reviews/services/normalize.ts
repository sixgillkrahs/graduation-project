import { IResp } from "@/@types/service";

type ReviewApiReply =
  | string
  | {
      content?: string;
      repliedAt?: string;
    }
  | null
  | undefined;

type ReviewApiAutoReply =
  | IReviewService.ReviewAutoReply
  | {
      draft?: string;
      status?: IReviewService.ReviewAutoReplyStatus;
      generatedAt?: string;
      appliedAt?: string;
      error?: string;
    }
  | null
  | undefined;

type ReviewApiItem = Partial<IReviewService.ReviewItem> & {
  _id?: string;
  id?: string;
  rating?: number;
  tags?: string[];
  comment?: string;
  propertyName?: string;
  customerName?: string;
  customerInitial?: string;
  createdAt?: string;
  status?: IReviewService.ReviewStatus;
  agentReply?: ReviewApiReply;
  agentReplyAt?: string;
  reportedAt?: string;
  reportReason?: string;
  autoReply?: ReviewApiAutoReply;
  autoReplyDraft?: string;
  autoReplyStatus?: IReviewService.ReviewAutoReplyStatus;
  autoReplyGeneratedAt?: string;
  autoReplyAppliedAt?: string;
  autoReplyError?: string;
};

const maskCustomerName = (name?: string) => {
  const firstToken = name?.trim().split(/\s+/)[0] || "";
  const initial = firstToken.charAt(0).toUpperCase();

  return initial ? `${initial}***` : "";
};

const getCustomerInitial = (name?: string, fallback?: string) =>
  fallback || maskCustomerName(name).charAt(0) || "K";

const normalizeReply = (
  reply: ReviewApiReply,
  repliedAt?: string,
): IReviewService.ReviewReply | null => {
  if (!reply) {
    return null;
  }

  if (typeof reply === "string") {
    const normalizedReply = reply.trim();

    return normalizedReply
      ? {
          content: normalizedReply,
          repliedAt,
        }
      : null;
  }

  const normalizedContent = reply.content?.trim();

  return normalizedContent
    ? {
        content: normalizedContent,
        repliedAt: reply.repliedAt || repliedAt,
      }
    : null;
};

const normalizeAutoReply = (
  review: ReviewApiItem,
): IReviewService.ReviewAutoReply | null => {
  const nestedAutoReply =
    review.autoReply && typeof review.autoReply === "object"
      ? review.autoReply
      : null;
  const draft = (nestedAutoReply?.draft || review.autoReplyDraft || "").trim();
  const status =
    nestedAutoReply?.status || review.autoReplyStatus || ("IDLE" as const);
  const generatedAt =
    nestedAutoReply?.generatedAt || review.autoReplyGeneratedAt;
  const appliedAt = nestedAutoReply?.appliedAt || review.autoReplyAppliedAt;
  const error = (nestedAutoReply?.error || review.autoReplyError || "").trim();

  if (status === "IDLE" && !draft && !generatedAt && !appliedAt && !error) {
    return null;
  }

  return {
    draft,
    status,
    generatedAt,
    appliedAt,
    error,
  };
};

export const normalizeReviewItem = (
  review: ReviewApiItem,
): IReviewService.ReviewItem => {
  const fallbackCustomerName =
    review.customerName?.trim() || review.customerInitial || "Khách hàng";

  return {
    id: review.id || review._id || "",
    rating: review.rating || 0,
    tags: review.tags || [],
    comment: review.comment || "",
    propertyName: review.propertyName || "",
    customerName:
      review.customerInitial && review.customerName
        ? review.customerName
        : maskCustomerName(review.customerName) || fallbackCustomerName,
    customerInitial: getCustomerInitial(
      review.customerName,
      review.customerInitial,
    ),
    createdAt: review.createdAt,
    status: (review.status || "PENDING") as IReviewService.ReviewStatus,
    agentReply: normalizeReply(review.agentReply, review.agentReplyAt),
    reportedAt: review.reportedAt,
    reportReason: review.reportReason || "",
    autoReply: normalizeAutoReply(review),
  };
};

export const normalizeReviewListResponse = <
  T extends
    | IReviewService.AgentListResponse
    | IReviewService.PublicListResponse,
>(
  payload: T,
): T => {
  return {
    ...payload,
    results: (payload.results || []).map(normalizeReviewItem),
  };
};

export const normalizeReviewResponse = (
  response: IResp<ReviewApiItem>,
): IResp<IReviewService.ReviewItem> => ({
  ...response,
  data: normalizeReviewItem(response.data),
});

export const normalizeReviewListApiResponse = <
  T extends
    | IReviewService.AgentListResponse
    | IReviewService.PublicListResponse,
>(
  response: IResp<T>,
): IResp<T> => ({
  ...response,
  data: normalizeReviewListResponse(response.data),
});

export const normalizePublicReviewListApiResponse = (
  response: IResp<IReviewService.PublicListResponse>,
): IResp<IReviewService.PublicListResponse> =>
  normalizeReviewListApiResponse(response);

export const normalizeAgentReviewListApiResponse = (
  response: IResp<IReviewService.AgentListResponse>,
): IResp<IReviewService.AgentListResponse> =>
  normalizeReviewListApiResponse(response);
