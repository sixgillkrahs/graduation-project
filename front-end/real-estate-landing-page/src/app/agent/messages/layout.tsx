import type { Metadata } from "next";
import Sidebar from "@/components/layout/message/Sidebar";

export const metadata: Metadata = {
  title: "Messages",
};

export default function MessagesLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex h-[calc(100vh-80px)]">
      <Sidebar>{children}</Sidebar>
    </div>
  );
}
