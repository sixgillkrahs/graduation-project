"use client";

import ReviewSubmissionModal from "@/components/features/agent-public-profile/components/ReviewSubmissionModal";
import { ROUTES } from "@/const/routes";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useCreateReview } from "./services/mutate";
import { useGetReviewInvitation } from "./services/query";

type ReviewInvitationProps = {
  token: string;
};

const ReviewInvitation = ({ token }: ReviewInvitationProps) => {
  const router = useRouter();
  const { data, isLoading, error } = useGetReviewInvitation(token);
  const { mutateAsync: createReview, isPending } = useCreateReview();

  const handleClose = () => {
    router.push(ROUTES.HOME);
  };

  const handleSubmit = async (payload: {
    rating: number;
    tags: string[];
    comment: string;
  }) => {
    const response = await createReview({
      token,
      rating: payload.rating,
      tags: payload.tags,
      comment: payload.comment,
    });

    if (
      response.data.status === "PENDING" ||
      response.data.status === "AWAITING_ADMIN"
    ) {
      toast.success(
        "Đánh giá đã được tiếp nhận, sẽ qua batch AI và chờ Admin duyệt trước khi hiển thị.",
      );
      return;
    }

    toast.success("Đánh giá đã được tiếp nhận. Cảm ơn bạn đã phản hồi.");
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <div className="w-full max-w-md rounded-3xl border border-border bg-card p-6 text-center shadow-sm">
          <p className="text-sm font-medium text-muted-foreground">
            Đang tải lời mời đánh giá...
          </p>
        </div>
      </div>
    );
  }

  if (error || !data?.data) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <div className="w-full max-w-lg rounded-3xl border border-border bg-card p-6 text-center shadow-sm">
          <h1 className="text-xl font-semibold text-foreground">
            Lời mời đánh giá không còn hợp lệ
          </h1>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            Link này có thể đã hết hạn hoặc đã được sử dụng.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex min-h-[60vh] items-center justify-center px-4 py-16">
        <div className="w-full max-w-2xl rounded-[32px] border border-border bg-card p-8 text-center shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">
            Havenly Review
          </p>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-foreground">
            Hoàn tất đánh giá sau buổi xem nhà
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-muted-foreground">
            Popup đánh giá chỉ mở khi lời mời hợp lệ được tạo từ một lịch hẹn đã
            hoàn thành.
          </p>
        </div>
      </div>

      <ReviewSubmissionModal
        open={true}
        onClose={handleClose}
        agentName={data.data.agentName}
        propertyName={data.data.propertyName}
        quickTags={data.data.quickTags}
        isSubmitting={isPending}
        onSubmit={handleSubmit}
      />
    </>
  );
};

export default ReviewInvitation;
