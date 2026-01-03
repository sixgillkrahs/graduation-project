"use client";

import Profile from "@/components/features/profile";
import AuthGuard from "@/components/layout/AuthGuard";

const Page = () => {
  return (
    <AuthGuard>
      <Profile />
    </AuthGuard>
  );
};

export default Page;
