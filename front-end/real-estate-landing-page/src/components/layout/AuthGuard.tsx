"use client";

import { useGetMe } from "@/shared/auth/query";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const AuthGuard = ({ children }: { children: React.ReactNode }) => {
  const { data: me, isLoading, isError } = useGetMe();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && (isError || !me?.data?.userId)) {
      router.push("/");
    }
  }, [me, isLoading, isError, router]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
      </div>
    );
  }

  if (isError || !me?.data?.userId) {
    return null;
  }

  return <>{children}</>;
};

export default AuthGuard;
