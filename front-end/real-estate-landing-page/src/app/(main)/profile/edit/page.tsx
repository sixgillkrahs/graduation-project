import EditProfile from "@/components/features/edit-profile";
import AuthGuard from "@/components/layout/AuthGuard";

const Page = () => {
  return (
    <AuthGuard>
      <EditProfile />
    </AuthGuard>
  );
};

export default Page;
