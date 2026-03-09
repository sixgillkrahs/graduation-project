import AgentLeaderboard from "@/components/features/leaderboard";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Bảng Xếp Hạng Môi Giới | Havenly",
  description:
    "Xem bảng xếp hạng doanh thu hàng tháng của các chuyên viên môi giới bất động sản hàng đầu trên nền tảng Havenly.",
};

const Page = () => {
  return <AgentLeaderboard />;
};

export default Page;
