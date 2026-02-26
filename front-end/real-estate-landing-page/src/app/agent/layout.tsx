import type { Metadata } from "next";
import AuthGuard from "@/components/layout/AuthGuard";
import Sidebar from "@/components/layout/agent/Sidebar";

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
        <Sidebar>{children}</Sidebar>
      </div>
    </AuthGuard>
  );
}
