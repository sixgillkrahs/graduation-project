"use client";

import { CsButton } from "@/components/custom";
import { RootState } from "@/store";
import { useDateTimeFormatter } from "@/hooks/useDateTimeFormatter";
import {
  Flag,
  LoaderCircle,
  Lock,
  MessageSquareReply,
  RefreshCcw,
  Search,
  Send,
  ShieldAlert,
  Sparkles,
  Star,
  X,
} from "lucide-react";
import {
  startTransition,
  useDeferredValue,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useLocale } from "next-intl";
import { useSelector } from "react-redux";
import {
  useApplyAutoReply,
  useDiscardAutoReply,
  useGenerateAutoReply,
  useReplyReview,
  useReportReview,
} from "../reviews/services/mutate";
import { useGetMyReviews } from "../reviews/services/query";

const ITEMS_PER_PAGE = 6;

const getStatusLabel = (
  status: IReviewService.ReviewStatus,
  isVi: boolean,
) => {
  switch (status) {
    case "PENDING":
      return {
        label: isVi ? "Đang chờ AI quét" : "Waiting for AI scan",
        className:
          "border-[color:var(--color-border-primary)] bg-[color:var(--color-bg-primary)]/10 text-[color:var(--color-text-primary)]",
      };
    case "AWAITING_ADMIN":
      return {
        label: isVi ? "Chờ admin duyệt" : "Waiting for admin approval",
        className:
          "border-[color:var(--color-border-primary)] bg-[color:var(--color-bg-primary)]/10 text-[color:var(--color-text-primary)]",
      };
    case "REPORTED":
      return {
        label: isVi ? "Đã báo cáo admin" : "Reported to admin",
        className: "border-red-200 bg-red-50 text-red-600",
      };
    case "HIDDEN":
      return {
        label: isVi ? "Đã bị AI ẩn" : "Hidden by AI",
        className: "border-amber-200 bg-amber-50 text-amber-700",
      };
    case "PUBLISHED":
      return {
        label: isVi ? "Đang hiển thị" : "Published",
        className: "border-emerald-200 bg-emerald-50 text-emerald-600",
      };
    default:
      return {
        label: status,
        className: "border-border bg-muted text-muted-foreground",
      };
  }
};

const StarRow = ({ rating, size = 16 }: { rating: number; size?: number }) => {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, index) => {
        const active = index < rating;

        return (
          <Star
            key={`review-star-${index + 1}`}
            size={size}
            className={
              active
                ? "fill-[var(--color-rating-star)] text-[var(--color-rating-star)]"
                : "fill-transparent text-muted-foreground"
            }
          />
        );
      })}
    </div>
  );
};

const ReviewCard = ({
  review,
  isPro,
  onReply,
  onReport,
  onGenerateAutoReply,
  onApplyAutoReply,
  onDiscardAutoReply,
  isReplying,
  isReporting,
  isGeneratingAutoReply,
  isApplyingAutoReply,
  isDiscardingAutoReply,
  formatDate,
  isVi,
}: {
  review: IReviewService.ReviewItem;
  isPro: boolean;
  onReply: (reviewId: string, reply: string) => Promise<void>;
  onReport: (reviewId: string) => Promise<void>;
  onGenerateAutoReply: (reviewId: string) => Promise<void>;
  onApplyAutoReply: (reviewId: string, reply: string) => Promise<void>;
  onDiscardAutoReply: (reviewId: string) => Promise<void>;
  isReplying: boolean;
  isReporting: boolean;
  isGeneratingAutoReply: boolean;
  isApplyingAutoReply: boolean;
  isDiscardingAutoReply: boolean;
  formatDate: (value?: string | number | Date | null) => string;
  isVi: boolean;
}) => {
  const [replyOpen, setReplyOpen] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [autoReplyText, setAutoReplyText] = useState(
    review.autoReply?.draft || "",
  );
  const statusMeta = getStatusLabel(review.status, isVi);
  const canReply =
    ["PUBLISHED", "REPORTED"].includes(review.status) && !review.agentReply;
  const canReport = review.status === "PUBLISHED";
  const canUseAutoReply = isPro && review.status === "PUBLISHED" && canReply;
  const autoReplyStatus = review.autoReply?.status || "IDLE";
  const hasReadyAutoReply =
    autoReplyStatus === "READY" && Boolean(review.autoReply?.draft?.trim());

  useEffect(() => {
    setAutoReplyText(review.autoReply?.draft || "");
  }, [review.autoReply?.draft]);

  return (
    <article className="rounded-[28px] border border-border bg-card p-5 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-full border border-border bg-muted text-sm font-semibold text-foreground">
            {review.customerInitial}
          </div>
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-semibold text-foreground">
                {review.customerName}
              </p>
              <span className="text-xs text-muted-foreground">•</span>
              <p className="text-xs text-muted-foreground">
                {formatDate(review.createdAt)}
              </p>
              <span
                className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold ${statusMeta.className}`}
              >
                {statusMeta.label}
              </span>
            </div>
            <StarRow rating={review.rating} size={15} />
          </div>
        </div>

        <button
          type="button"
          disabled={!canReport || isReporting}
          onClick={() => onReport(review.id)}
          className="inline-flex items-center justify-center rounded-xl border border-border px-3 py-2 text-xs font-medium text-muted-foreground transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isReporting ? (
            <LoaderCircle className="size-4 animate-spin" />
          ) : (
            <Flag className="size-4" />
          )}
          <span className="ml-2">
            {isVi ? "Báo cáo admin" : "Report to Admin"}
          </span>
        </button>
      </div>

      <div className="mt-4 rounded-2xl border border-border/70 bg-muted/20 p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          {isVi ? "Buổi xem nhà" : "Viewing session"}
        </p>
        <p className="mt-2 text-sm font-medium text-foreground">
          {review.propertyName}
        </p>
      </div>

      {review.tags.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {review.tags.map((tag) => (
            <span
              key={`${review.id}-${tag}`}
              className="rounded-full border border-[color:var(--color-border-primary)] bg-[color:var(--color-bg-primary)]/10 px-3 py-1 text-xs font-medium text-[color:var(--color-text-primary)]"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      <p className="mt-4 text-sm leading-7 text-foreground/85">
        {review.comment ||
          (isVi
            ? "Khách hàng không để lại nhận xét chi tiết."
            : "The customer did not leave a detailed review.")}
      </p>

      {review.status === "PENDING" && (
        <div className="mt-4 flex items-start gap-2 rounded-2xl border border-[color:var(--color-border-primary)] bg-[color:var(--color-bg-primary)]/10 px-4 py-3 text-sm text-[color:var(--color-text-primary)]">
          <ShieldAlert className="mt-0.5 size-4 shrink-0" />
          <p>
            {isVi
              ? "Review này đang chờ batch AI quét trước khi chuyển đến admin."
              : "This review is waiting for the AI batch scan before reaching admin."}
          </p>
        </div>
      )}

      {review.status === "AWAITING_ADMIN" && (
        <div className="mt-4 flex items-start gap-2 rounded-2xl border border-[color:var(--color-border-primary)] bg-[color:var(--color-bg-primary)]/10 px-4 py-3 text-sm text-[color:var(--color-text-primary)]">
          <ShieldAlert className="mt-0.5 size-4 shrink-0" />
          <p>
            {isVi
              ? "AI đã quét xong và review này đang chờ admin duyệt."
              : "The AI scan is complete and this review is waiting for admin approval."}
          </p>
        </div>
      )}

      {review.status === "REPORTED" && (
        <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {isVi
            ? "Review đang bị ẩn tạm thời để admin kiểm tra."
            : "This review is temporarily hidden while admin reviews it."}
        </div>
      )}

      {review.status === "HIDDEN" && (
        <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
          {isVi
            ? "Review đã bị ẩn sau khi batch AI đánh giá nội dung không phù hợp."
            : "This review was hidden after the AI batch flagged the content as inappropriate."}
        </div>
      )}

      {canReply && isPro && (
        <div className="mt-4 rounded-2xl border border-[color:var(--color-border-primary)] bg-[color:var(--color-bg-primary)]/10 px-4 py-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--color-text-primary)]">
                {isVi ? "Trợ lý phản hồi AI" : "AI Reply Assistant"}
              </p>
              <p className="mt-2 text-sm leading-6 text-foreground/80">
                {isVi
                  ? "Chỉ agent PRO mới có thể tạo gợi ý AI cho phản hồi review."
                  : "Only PRO agents can generate AI suggestions for review replies."}
              </p>
            </div>

            <CsButton
              type="button"
              onClick={() => onGenerateAutoReply(review.id)}
              disabled={
                isGeneratingAutoReply || autoReplyStatus === "GENERATING"
              }
              variant="secondary"
            >
              {isGeneratingAutoReply || autoReplyStatus === "GENERATING" ? (
                <LoaderCircle className="mr-2 size-4 animate-spin" />
              ) : hasReadyAutoReply ? (
                <RefreshCcw className="mr-2 size-4" />
              ) : (
                <Sparkles className="mr-2 size-4" />
              )}
              {hasReadyAutoReply
                ? isVi
                  ? "Tạo lại gợi ý AI"
                  : "Regenerate AI suggestion"
                : isVi
                  ? "Tạo gợi ý AI"
                  : "Generate AI suggestion"}
            </CsButton>
          </div>

          {autoReplyStatus === "FAILED" && review.autoReply?.error && (
            <p className="mt-3 text-sm text-red-600">
              {review.autoReply.error}
            </p>
          )}

          {hasReadyAutoReply && (
            <div className="mt-4 space-y-3 rounded-2xl border border-border bg-background px-4 py-4">
              <textarea
                rows={4}
                value={autoReplyText}
                onChange={(event) => setAutoReplyText(event.target.value)}
                placeholder={
                  isVi
                    ? "AI sẽ đề xuất câu trả lời để bạn xem lại trước khi đăng."
                    : "AI will draft a reply for you to review before posting."
                }
                className="w-full rounded-2xl border border-border bg-card px-4 py-3 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-4 focus:ring-primary/10"
              />
              <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => onDiscardAutoReply(review.id)}
                  disabled={isDiscardingAutoReply}
                  className="inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium text-muted-foreground transition hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isDiscardingAutoReply ? (
                    <LoaderCircle className="mr-2 size-4 animate-spin" />
                  ) : (
                    <X className="mr-2 size-4" />
                  )}
                  {isVi ? "Bỏ qua" : "Discard"}
                </button>
                <button
                  type="button"
                  disabled={!autoReplyText.trim() || isApplyingAutoReply}
                  onClick={() => onApplyAutoReply(review.id, autoReplyText)}
                  className="inline-flex items-center justify-center rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isApplyingAutoReply ? (
                    <LoaderCircle className="mr-2 size-4 animate-spin" />
                  ) : (
                    <Sparkles className="mr-2 size-4" />
                  )}
                  {isVi ? "Dùng phản hồi AI" : "Use AI Reply"}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {canReply && !isPro && review.status === "PUBLISHED" && (
        <div className="mt-4 flex items-start gap-3 rounded-2xl border border-dashed border-border bg-muted/20 px-4 py-4 text-sm text-muted-foreground">
          <Lock className="mt-0.5 size-4 shrink-0" />
          <p>
            {isVi
              ? "Trợ lý phản hồi AI chỉ mở cho agent đang dùng Havenly PRO."
              : "AI Reply Assistant is only available for agents on Havenly PRO."}
          </p>
        </div>
      )}

      {review.agentReply ? (
        <div className="mt-4 rounded-2xl border border-border bg-background px-4 py-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            {isVi ? "Phản hồi của bạn" : "Your Reply"}
          </p>
          <p className="mt-2 text-sm leading-7 text-foreground/85">
            {review.agentReply.content}
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            {formatDate(review.agentReply.repliedAt)}
          </p>
        </div>
      ) : canReply ? (
        <div className="mt-4 rounded-2xl border border-border bg-background px-4 py-4">
          {replyOpen ? (
            <div className="space-y-3">
              <textarea
                rows={4}
                value={replyText}
                onChange={(event) => setReplyText(event.target.value)}
                placeholder={
                  isVi
                    ? "Cảm ơn anh chị đã tin tưởng. Hãy để lại một phản hồi chuyên nghiệp."
                    : "Thank you for your trust. Leave a professional and thoughtful reply."
                }
                className="w-full rounded-2xl border border-border bg-card px-4 py-3 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-4 focus:ring-primary/10"
              />
              <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setReplyOpen(false);
                    setReplyText("");
                  }}
                  className="inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium text-muted-foreground transition hover:text-foreground"
                >
                  <X className="mr-2 size-4" />
                  {isVi ? "Hủy" : "Cancel"}
                </button>
                <button
                  type="button"
                  disabled={!replyText.trim() || isReplying}
                  onClick={async () => {
                    await onReply(review.id, replyText);
                    setReplyText("");
                    setReplyOpen(false);
                  }}
                  className="inline-flex items-center justify-center rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isReplying ? (
                    <LoaderCircle className="mr-2 size-4 animate-spin" />
                  ) : (
                    <Send className="mr-2 size-4" />
                  )}
                  {isVi ? "Gửi phản hồi" : "Send Reply"}
                </button>
              </div>
            </div>
          ) : (
            <CsButton
              type="button"
              onClick={() => setReplyOpen(true)}
              variant="secondary"
            >
              <MessageSquareReply className="mr-2 size-4" />
              {isVi ? "Trả lời khách hàng" : "Reply to customer"}
            </CsButton>
          )}
        </div>
      ) : null}
    </article>
  );
};

const MyReviews = () => {
  const locale = useLocale();
  const isVi = locale.toLowerCase().startsWith("vi");
  const { formatDate } = useDateTimeFormatter();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<IReviewService.ReviewFilter>("all");
  const [page, setPage] = useState(1);
  const { data: profileData } = useSelector(
    (state: RootState) => state.profile,
  );
  const deferredSearch = useDeferredValue(search);
  const queryParams = useMemo(
    () => ({
      page,
      limit: ITEMS_PER_PAGE,
      search: deferredSearch || undefined,
      filter,
    }),
    [deferredSearch, filter, page],
  );

  const { data, isLoading } = useGetMyReviews(queryParams);
  const isPro = profileData?.planInfo?.plan === "PRO";
  const { mutateAsync: replyReview, isPending: isReplying } = useReplyReview();
  const { mutateAsync: generateAutoReply, isPending: isGeneratingAutoReply } =
    useGenerateAutoReply();
  const { mutateAsync: applyAutoReply, isPending: isApplyingAutoReply } =
    useApplyAutoReply();
  const { mutateAsync: discardAutoReply, isPending: isDiscardingAutoReply } =
    useDiscardAutoReply();
  const { mutateAsync: reportReview, isPending: isReporting } =
    useReportReview();

  const reviewData = data?.data;
  const reviews = reviewData?.results || [];
  const summary = reviewData?.summary;
  const totalPages = reviewData?.totalPages || 1;
  const filters: Array<{
    label: string;
    value: IReviewService.ReviewFilter;
  }> = [
    { label: isVi ? "Tất cả" : "All", value: "all" },
    { label: isVi ? "5 sao" : "5 stars", value: "5star" },
    { label: isVi ? "1-3 sao" : "1-3 stars", value: "1-3star" },
    {
      label: isVi ? "Chưa phản hồi" : "Unanswered",
      value: "unanswered",
    },
  ];

  const handleReply = async (reviewId: string, reply: string) => {
    await replyReview({
      reviewId,
      reply: reply.trim(),
    });
  };

  const handleReport = async (reviewId: string) => {
    await reportReview({
      reviewId,
    });
  };

  const handleGenerateAutoReply = async (reviewId: string) => {
    await generateAutoReply({
      reviewId,
    });
  };

  const handleApplyAutoReply = async (reviewId: string, reply: string) => {
    await applyAutoReply({
      reviewId,
      reply: reply.trim(),
    });
  };

  const handleDiscardAutoReply = async (reviewId: string) => {
    await discardAutoReply({
      reviewId,
    });
  };

  return (
    <section className="space-y-6">
      <div className="rounded-[32px] border border-border bg-card p-6 shadow-sm md:p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-primary">
          {isVi ? "Không gian agent" : "Agent Space"}
        </p>
        <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-foreground">
              {isVi ? "Đánh giá của tôi" : "My Reviews"}
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground">
              {isVi
                ? "Theo dõi review đã hiển thị, review đang kiểm duyệt, phản hồi của bạn và gợi ý AI dành riêng cho agent PRO."
                : "Track published reviews, pending reviews, your replies, and AI-assisted drafts reserved for PRO agents."}
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-2xl border border-border bg-background px-4 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                {isVi ? "Điểm công khai" : "Public Rating"}
              </p>
              <p className="mt-2 text-3xl font-semibold tracking-tight text-foreground">
                {summary?.averageRating?.toFixed(1) || "0.0"}
              </p>
            </div>
            <div className="rounded-2xl border border-border bg-background px-4 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                {isVi ? "Tổng review" : "Total Reviews"}
              </p>
              <p className="mt-2 text-3xl font-semibold tracking-tight text-foreground">
                {summary?.totalReviews || 0}
              </p>
            </div>
            <div className="rounded-2xl border border-border bg-background px-4 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                {isVi ? "Đang chờ xử lý" : "Pending Review"}
              </p>
              <p className="mt-2 text-3xl font-semibold tracking-tight text-foreground">
                {summary?.pendingCount || 0}
              </p>
            </div>
            <div className="rounded-2xl border border-border bg-background px-4 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                {isVi ? "Chưa phản hồi" : "Unanswered"}
              </p>
              <p className="mt-2 text-3xl font-semibold tracking-tight text-foreground">
                {summary?.unansweredCount || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-[32px] border border-border bg-card p-6 shadow-sm md:p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <label className="relative block w-full max-w-xl">
            <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={search}
              onChange={(event) => {
                const nextValue = event.target.value;
                startTransition(() => {
                  setSearch(nextValue);
                  setPage(1);
                });
              }}
              placeholder={
                isVi
                  ? "Tìm theo khách hàng, nội dung hoặc bất động sản"
                  : "Search by customer, comment, or property"
              }
              className="h-12 w-full rounded-2xl border border-border bg-background pl-11 pr-4 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-4 focus:ring-primary/10"
            />
          </label>

          <div className="flex flex-wrap gap-2">
            {filters.map((item) => {
              const active = filter === item.value;

              return (
                <button
                  key={item.value}
                  type="button"
                  onClick={() =>
                    startTransition(() => {
                      setFilter(item.value);
                      setPage(1);
                    })
                  }
                  className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                    active
                      ? "border-[color:var(--color-border-primary)] bg-[color:var(--color-bg-primary)]/10 text-[color:var(--color-text-primary)]"
                      : "border-border bg-background text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between text-sm text-muted-foreground">
          <p>
            {isVi ? "Hiển thị" : "Showing"} {reviews.length} {isVi ? "/" : "of"}{" "}
            {reviewData?.totalResults || 0} {isVi ? "review" : "reviews"}
          </p>
          <p>
            {(summary?.hiddenCount || 0) + (summary?.reportedCount || 0)}{" "}
            {isVi ? "review đang bị ẩn" : "reviews are hidden"}
          </p>
        </div>

        {isLoading ? (
          <div className="flex min-h-60 items-center justify-center">
            <LoaderCircle className="size-6 animate-spin text-primary" />
          </div>
        ) : reviews.length === 0 ? (
          <div className="mt-6 rounded-[28px] border border-dashed border-border bg-muted/20 px-6 py-14 text-center">
            <p className="text-lg font-semibold text-foreground">
              {isVi ? "Chưa có review phù hợp" : "No matching reviews"}
            </p>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              {isVi
                ? "Khi khách hàng hoàn tất buổi xem nhà và gửi đánh giá, review sẽ xuất hiện tại đây."
                : "Once customers complete a viewing and submit a review, it will appear here."}
            </p>
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            {reviews.map((review) => (
              <ReviewCard
                key={review.id}
                review={review}
                isPro={isPro}
                onReply={handleReply}
                onReport={handleReport}
                onGenerateAutoReply={handleGenerateAutoReply}
                onApplyAutoReply={handleApplyAutoReply}
                onDiscardAutoReply={handleDiscardAutoReply}
                isReplying={isReplying}
                isReporting={isReporting}
                isGeneratingAutoReply={isGeneratingAutoReply}
                isApplyingAutoReply={isApplyingAutoReply}
                isDiscardingAutoReply={isDiscardingAutoReply}
                formatDate={formatDate}
                isVi={isVi}
              />
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="mt-6 flex flex-col gap-3 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">
              {isVi ? "Trang" : "Page"} {reviewData?.page || page} /{" "}
              {totalPages}
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() =>
                  startTransition(() => setPage((current) => current - 1))
                }
                className="rounded-xl border border-border px-4 py-2 text-sm font-medium text-foreground transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isVi ? "Trước" : "Previous"}
              </button>
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() =>
                  startTransition(() => setPage((current) => current + 1))
                }
                className="rounded-xl border border-border px-4 py-2 text-sm font-medium text-foreground transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isVi ? "Sau" : "Next"}
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default MyReviews;
