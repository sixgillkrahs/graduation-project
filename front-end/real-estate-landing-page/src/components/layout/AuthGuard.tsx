"use client";

import { ROUTES } from "@/const/routes";
import { useGetMe } from "@/shared/auth/query";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store";
import { setUser } from "@/store/auth.store";

const AuthGuard = ({ children }: { children: React.ReactNode }) => {
  const { data: me, isLoading, isError } = useGetMe();
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();

  useEffect(() => {
    if (me?.data) {
      dispatch(
        setUser({
          user: me.data.userId,
          role: me.data.roleId,
        }),
      );
    }
  }, [me, dispatch]);

  useEffect(() => {
    if (!isLoading && (isError || !me?.data?.userId)) {
      router.push(ROUTES.HOME);
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
