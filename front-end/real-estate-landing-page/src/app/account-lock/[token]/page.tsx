import AccountLockAppeal from "@/components/features/account-lock-appeal";

type AccountLockPageProps = {
  params: Promise<{
    token: string;
  }>;
};

const AccountLockPage = async ({ params }: AccountLockPageProps) => {
  const { token } = await params;

  return <AccountLockAppeal token={token} />;
};

export default AccountLockPage;
