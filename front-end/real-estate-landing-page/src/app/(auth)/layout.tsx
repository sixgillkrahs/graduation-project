import type { Metadata } from "next";
import Header from "@/components/layout/auth/Header";
import Sider from "@/components/layout/Sider";

export const metadata: Metadata = {
  title: "Havenly",
  description: "Real Estate Landing Page",
};

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="grid grid-cols-3 h-screen">
      <div className="col-span-1">
        <div className="px-10 py-5 h-full">
          <Header />
          {children}
        </div>
      </div>
      <div className="col-span-2 bg-[#F5F5F5] hidden md:block">
        <Sider />
      </div>
    </div>
  );
}
