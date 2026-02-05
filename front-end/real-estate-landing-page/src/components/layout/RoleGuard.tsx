"use client";

import { useGetMe } from "@/shared/auth/query";
import { notFound } from "next/navigation";
import { useEffect, useState } from "react";

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: string[];
}

const RoleGuard = ({ children, allowedRoles }: RoleGuardProps) => {
  const { data: me, isLoading } = useGetMe();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    if (!isLoading) {
      setIsChecking(false);
    }
  }, [isLoading]);

  if (isLoading || isChecking) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
      </div>
    );
  }

  const userRoles = me?.data?.userId?.roles || [];
  const hasPermission = userRoles.some((role: string) =>
    allowedRoles.includes(role),
  );

  if (!me?.data?.userId || !hasPermission) {
    notFound();
    return null;
  }

  return <>{children}</>;
};

export default RoleGuard;
