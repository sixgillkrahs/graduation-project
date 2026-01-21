import Sidebar from "@/components/layout/message/Sidebar";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Messages",
  description: "Real Estate Landing Page",
};

export default function MessagesLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex h-screen">
      <Sidebar>{children}</Sidebar>
    </div>
  );
}
