"use client";

import { CsButton } from "@/components/custom";
import { RootState } from "@/store";
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

const FILTERS: Array<{
  label: string;
  value: IReviewService.ReviewFilter;
}> = [
  { label: "Tat ca", value: "all" },
  { label: "5 sao", value: "5star" },
  { label: "1-3 sao", value: "1-3star" },
  { label: "Chua phan hoi", value: "unanswered" },
];

const formatDate = (value?: string) => {
  if (!value) {
    return "--";
  }

  return new Date(value).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const getStatusLabel = (status: IReviewService.ReviewStatus) => {
  switch (status) {
    case "PENDING":
      return {
        label: "Dang cho AI quet",
        className:
          "border-[color:var(--color-border-primary)] bg-[color:var(--color-bg-primary)]/10 text-[color:var(--color-text-primary)]",
      };
    case "AWAITING_ADMIN":
      return {
        label: "Cho Admin duyet",
        className:
          "border-[color:var(--color-border-primary)] bg-[color:var(--color-bg-primary)]/10 text-[color:var(--color-text-primary)]",
      };
    case "REPORTED":
      return {
        label: "Da bao cao Admin",
        className: "border-red-200 bg-red-50 text-red-600",
      };
    case "PUBLISHED":
      return {
        label: "Dang hien thi",
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
}) => {
  const [replyOpen, setReplyOpen] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [autoReplyText, setAutoReplyText] = useState(
    review.autoReply?.draft || "",
  );
  const statusMeta = getStatusLabel(review.status);
  const canReply =
    !["PENDING", "AWAITING_ADMIN"].includes(review.status) &&
    !review.agentReply;
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
          <span className="ml-2">Report to Admin</span>
        </button>
      </div>

      <div className="mt-4 rounded-2xl border border-border/70 bg-muted/20 p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          Buoi xem nha
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
        {review.comment || "Khach hang khong de lai nhan xet chi tiet."}
      </p>

      {review.status === "PENDING" && (
        <div className="mt-4 flex items-start gap-2 rounded-2xl border border-[color:var(--color-border-primary)] bg-[color:var(--color-bg-primary)]/10 px-4 py-3 text-sm text-[color:var(--color-text-primary)]">
          <ShieldAlert className="mt-0.5 size-4 shrink-0" />
          <p>Review nay dang cho batch AI quet truoc khi chuyen den admin.</p>
        </div>
      )}

      {review.status === "AWAITING_ADMIN" && (
        <div className="mt-4 flex items-start gap-2 rounded-2xl border border-[color:var(--color-border-primary)] bg-[color:var(--color-bg-primary)]/10 px-4 py-3 text-sm text-[color:var(--color-text-primary)]">
          <ShieldAlert className="mt-0.5 size-4 shrink-0" />
          <p>AI da quet xong va review nay dang cho admin duyet.</p>
        </div>
      )}

      {review.status === "REPORTED" && (
        <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          Review da bi an tam thoi de admin kiem tra.
        </div>
      )}

      {canReply && isPro && (
        <div className="mt-4 rounded-2xl border border-[color:var(--color-border-primary)] bg-[color:var(--color-bg-primary)]/10 px-4 py-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--color-text-primary)]">
                AI Reply Assistant
              </p>
              <p className="mt-2 text-sm leading-6 text-foreground/80">
                Chi agent PRO moi co the tao goi y AI cho phan hoi review.
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
              {hasReadyAutoReply ? "Tao lai goi y AI" : "Tao goi y AI"}
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
                placeholder="AI se de xuat cau tra loi de ban xem lai truoc khi dang."
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
                  Bo qua
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
                  Dang phan hoi AI
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {canReply && !isPro && review.status === "PUBLISHED" && (
        <div className="mt-4 flex items-start gap-3 rounded-2xl border border-dashed border-border bg-muted/20 px-4 py-4 text-sm text-muted-foreground">
          <Lock className="mt-0.5 size-4 shrink-0" />
          <p>AI Reply Assistant chi mo cho agent dang dung Havenly PRO.</p>
        </div>
      )}

      {review.agentReply ? (
        <div className="mt-4 rounded-2xl border border-border bg-background px-4 py-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Phan hoi cua ban
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
                placeholder="Cam on anh chi da tin tuong. Hay de lai mot phan hoi chuyen nghiep."
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
                  Huy
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
                  Gui phan hoi
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
              Tra loi khach hang
            </CsButton>
          )}
        </div>
      ) : null}
    </article>
  );
};

const MyReviews = () => {
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
          Agent Space
        </p>
        <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-foreground">
              My Reviews
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground">
              Theo doi review da publish, review dang kiem duyet, phan hoi cua
              ban va tinh nang AI goi y danh rieng cho agent PRO.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-2xl border border-border bg-background px-4 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Diem cong khai
              </p>
              <p className="mt-2 text-3xl font-semibold tracking-tight text-foreground">
                {summary?.averageRating?.toFixed(1) || "0.0"}
              </p>
            </div>
            <div className="rounded-2xl border border-border bg-background px-4 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Tong review
              </p>
              <p className="mt-2 text-3xl font-semibold tracking-tight text-foreground">
                {summary?.totalReviews || 0}
              </p>
            </div>
            <div className="rounded-2xl border border-border bg-background px-4 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Dang kiem duyet
              </p>
              <p className="mt-2 text-3xl font-semibold tracking-tight text-foreground">
                {summary?.pendingCount || 0}
              </p>
            </div>
            <div className="rounded-2xl border border-border bg-background px-4 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Chua phan hoi
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
              placeholder="Tim theo khach hang, noi dung hoac bat dong san"
              className="h-12 w-full rounded-2xl border border-border bg-background pl-11 pr-4 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-4 focus:ring-primary/10"
            />
          </label>

          <div className="flex flex-wrap gap-2">
            {FILTERS.map((item) => {
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
            Hien thi {reviews.length} / {reviewData?.totalResults || 0} review
          </p>
          <p>{summary?.reportedCount || 0} review dang bi an do bao cao</p>
        </div>

        {isLoading ? (
          <div className="flex min-h-60 items-center justify-center">
            <LoaderCircle className="size-6 animate-spin text-primary" />
          </div>
        ) : reviews.length === 0 ? (
          <div className="mt-6 rounded-[28px] border border-dashed border-border bg-muted/20 px-6 py-14 text-center">
            <p className="text-lg font-semibold text-foreground">
              Chua co review phu hop
            </p>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Khi khach hang hoan tat buoi xem nha va gui danh gia, review se
              xuat hien tai day.
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
              />
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="mt-6 flex flex-col gap-3 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">
              Trang {reviewData?.page || page} / {totalPages}
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
                Truoc
              </button>
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() =>
                  startTransition(() => setPage((current) => current + 1))
                }
                className="rounded-xl border border-border px-4 py-2 text-sm font-medium text-foreground transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
              >
                Sau
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default MyReviews;
