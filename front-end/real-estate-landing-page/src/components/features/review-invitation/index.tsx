"use client";

import { useRouter } from "next/navigation";
import ReviewSubmissionModal from "@/components/features/agent-public-profile/components/ReviewSubmissionModal";
import { ROUTES } from "@/const/routes";
import { toast } from "@/lib/toast";
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

    if (response.data.status === "PUBLISHED") {
      toast.success(
        "Danh gia da hien thi ngay. Backend se quet batch AI sau do va co the an lai neu noi dung khong phu hop.",
      );
      return;
    }

    toast.success("Danh gia da duoc tiep nhan.");
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <div className="w-full max-w-md rounded-3xl border border-border bg-card p-6 text-center shadow-sm">
          <p className="text-sm font-medium text-muted-foreground">
            Dang tai loi moi danh gia...
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
            Loi moi danh gia khong con hop le
          </h1>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            Link nay co the da het han hoac da duoc su dung.
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
            Hoan tat danh gia sau buoi xem nha
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-muted-foreground">
            Review se duoc hien thi ngay sau khi gui. He thong van tiep tuc gom
            batch de AI quet noi dung va co the an lai neu khong phu hop.
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
