import type { Metadata } from "next";
import ChatWidget from "@/components/features/message/ChatWidget";
import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";

export const metadata: Metadata = {
  title: "Havenly",
  description: "Real Estate Landing Page",
};

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="relative">
      <Header />
      {children}
      <Footer />
      <ChatWidget />
    </div>
  );
}
