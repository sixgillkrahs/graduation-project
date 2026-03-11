"use client";

import { Avatar } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { Star, X } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";

const FEEDBACK_TAGS = [
  "Nhiệt tình",
  "Đúng giờ",
  "Am hiểu thị trường",
  "Hỗ trợ pháp lý tốt",
] as const;

const RATING_COPY: Record<number, string> = {
  0: "Hãy chọn số sao để tiếp tục.",
  1: "Cần cải thiện thêm",
  2: "Chưa đúng kỳ vọng",
  3: "Tạm ổn",
  4: "Rất tốt",
  5: "Tuyệt vời!",
};

type ReviewSubmissionModalProps = {
  open: boolean;
  onClose: () => void;
  agentName: string;
  agentAvatar?: string;
  propertyName: string;
  quickTags?: readonly string[];
  isSubmitting?: boolean;
  onSubmit?: (payload: {
    rating: number;
    tags: string[];
    comment: string;
  }) => Promise<void> | void;
};

const ReviewSubmissionModal = ({
  open,
  onClose,
  agentName,
  agentAvatar,
  propertyName,
  quickTags = FEEDBACK_TAGS,
  isSubmitting = false,
  onSubmit,
}: ReviewSubmissionModalProps) => {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [comment, setComment] = useState("");

  const activeRating = hoveredRating || rating;
  const initials = agentName
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  const resetForm = () => {
    setRating(0);
    setHoveredRating(0);
    setSelectedTags([]);
    setComment("");
  };

  useEffect(() => {
    if (!open) {
      setHoveredRating(0);
    }
  }, [open]);

  const handleToggleTag = (tag: string) => {
    setSelectedTags((current) =>
      current.includes(tag)
        ? current.filter((item) => item !== tag)
        : [...current, tag],
    );
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!rating) {
      return;
    }

    await onSubmit?.({
      rating,
      tags: selectedTags,
      comment: comment.trim(),
    });

    resetForm();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => !nextOpen && handleClose()}>
      <DialogContent
        showCloseButton={false}
        className="max-h-[calc(100vh-2rem)] max-w-2xl gap-0 overflow-hidden rounded-xl border border-border bg-background p-0 shadow-2xl sm:max-w-[720px]"
      >
        <DialogTitle className="sr-only">
          Submit a review for this agent
        </DialogTitle>
        <DialogDescription className="sr-only">
          Share your rating, strengths, and optional comments after the property
          viewing.
        </DialogDescription>

        <form
          onSubmit={handleSubmit}
          className="flex max-h-[calc(100vh-2rem)] flex-col overflow-hidden"
        >
          <div className="flex items-start justify-between gap-4 border-b border-border/70 px-5 py-5 sm:px-6">
            <div className="flex min-w-0 items-start gap-3">
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-primary/10 blur-md" />
                <div className="relative size-12 overflow-hidden rounded-full ring-1 ring-border">
                  <Avatar
                    src={agentAvatar}
                    alt={agentName}
                    className="size-full rounded-full bg-primary text-sm font-semibold text-primary-foreground"
                  />
                  {!agentAvatar && (
                    <div className="absolute inset-0 flex items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                      {initials}
                    </div>
                  )}
                </div>
              </div>

              <div className="min-w-0">
                <p className="text-sm text-muted-foreground">
                  Đánh giá trải nghiệm với
                </p>
                <h2 className="truncate text-xl font-semibold text-foreground">
                  {agentName}
                </h2>
                <p className="mt-1 text-sm italic text-muted-foreground">
                  Liên quan đến buổi xem nhà tại: {propertyName}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleClose}
              className="inline-flex size-10 shrink-0 items-center justify-center rounded-full border border-border bg-background text-muted-foreground transition hover:border-primary/30 hover:text-foreground focus:outline-none focus:ring-4 focus:ring-primary/10"
              aria-label="Close review modal"
            >
              <X className="size-4" />
            </button>
          </div>

          <div className="space-y-6 overflow-y-auto px-5 py-5 sm:px-6 sm:py-6">
            <section className="rounded-2xl border border-border bg-muted/20 p-4 sm:p-5">
              <div className="flex flex-wrap items-center gap-2">
                {Array.from({ length: 5 }).map((_, index) => {
                  const starValue = index + 1;
                  const isActive = starValue <= activeRating;

                  return (
                    <button
                      key={starValue}
                      type="button"
                      onClick={() => setRating(starValue)}
                      onMouseEnter={() => setHoveredRating(starValue)}
                      onMouseLeave={() => setHoveredRating(0)}
                      className="rounded-full p-1 transition-transform hover:-translate-y-0.5 focus:outline-none focus:ring-4 focus:ring-primary/10"
                      aria-label={`Rate ${starValue} star${starValue > 1 ? "s" : ""}`}
                    >
                      <Star
                        className={cn(
                          "size-9 transition-colors sm:size-10",
                          isActive
                            ? "fill-[var(--color-rating-star)] text-[var(--color-rating-star)]"
                            : "fill-transparent text-muted-foreground",
                        )}
                      />
                    </button>
                  );
                })}
              </div>
              <p className="mt-3 text-sm font-medium text-foreground">
                {RATING_COPY[activeRating]}
              </p>
            </section>

            <section>
              <h3 className="text-sm font-semibold text-foreground">
                Môi giới đã hỗ trợ tốt ở điểm nào? (Có thể chọn nhiều)
              </h3>
              <div className="mt-3 flex flex-wrap gap-2.5">
                {quickTags.map((tag) => {
                  const isSelected = selectedTags.includes(tag);

                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => handleToggleTag(tag)}
                      className={cn(
                        "rounded-full border px-4 py-2 text-sm font-medium transition focus:outline-none focus:ring-4 focus:ring-primary/10",
                        isSelected
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border bg-background text-muted-foreground hover:border-primary/30 hover:text-foreground",
                      )}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>
            </section>

            <section>
              <label
                htmlFor="review-comment"
                className="text-sm font-semibold text-foreground"
              >
                Nội dung nhận xét
              </label>
              <textarea
                id="review-comment"
                rows={4}
                value={comment}
                onChange={(event) => setComment(event.target.value)}
                placeholder="Chia sẻ thêm về trải nghiệm của bạn... (Không bắt buộc)"
                className="mt-3 min-h-32 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-4 focus:ring-primary/10"
              />
            </section>
          </div>

          <div className="flex flex-col-reverse gap-3 border-t border-border/70 bg-background px-5 py-4 sm:flex-row sm:items-center sm:justify-end sm:px-6">
            <button
              type="button"
              onClick={handleClose}
              className="inline-flex w-full items-center justify-center rounded-xl px-4 py-3 text-sm font-medium text-muted-foreground transition hover:text-foreground focus:outline-none focus:ring-4 focus:ring-primary/10 sm:w-auto"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={!rating || isSubmitting}
              className="inline-flex w-full items-center justify-center rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 focus:outline-none focus:ring-4 focus:ring-primary/10 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
            >
              {isSubmitting ? "Đang gửi..." : "Gửi đánh giá"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ReviewSubmissionModal;
