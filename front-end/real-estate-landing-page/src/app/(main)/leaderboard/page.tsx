import AgentLeaderboard from "@/components/features/leaderboard";
import { getBrandName, getLandingSettings } from "@/lib/landing-settings";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getLandingSettings();
  const brandName = getBrandName(settings);

  return {
    title: "Bảng Xếp Hạng Môi Giới",
    description: `Xem bảng xếp hạng doanh thu hàng tháng của các chuyên viên môi giới bất động sản hàng đầu trên nền tảng ${brandName}.`,
  };
}

const Page = () => {
  return <AgentLeaderboard />;
};

export default Page;
