import ReviewInvitation from "@/components/features/review-invitation";

type ReviewInvitationPageProps = {
  params: Promise<{
    token: string;
  }>;
};

const ReviewInvitationPage = async ({ params }: ReviewInvitationPageProps) => {
  const { token } = await params;

  return <ReviewInvitation token={token} />;
};

export default ReviewInvitationPage;
