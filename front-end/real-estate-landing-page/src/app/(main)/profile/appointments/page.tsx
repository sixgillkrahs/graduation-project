import AuthGuard from "@/components/layout/AuthGuard";
import MyAppointments from "@/components/features/my-appointments";

const Page = () => {
  return (
    <AuthGuard>
      <MyAppointments />
    </AuthGuard>
  );
};

export default Page;
