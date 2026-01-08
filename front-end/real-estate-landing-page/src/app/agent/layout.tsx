import AuthGuard from "@/components/layout/AuthGuard";
import Header from "@/components/layout/agent/Header";
import Sidebar from "@/components/layout/agent/Sidebar";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Agent Dashboard",
  description: "Real Estate Landing Page",
};

export default function AgentLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AuthGuard>
      <div className="flex h-screen">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Header />
          <div className="flex-1 overflow-y-auto bg-black/10 p-10">
            {children}
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
