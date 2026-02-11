"use client";

import { BadgeCheck, Building2, Eye, Users } from "lucide-react";
import CardStats, { CardStatsProps } from "./components/CardStats";
import ChartLine from "./components/ChartLine";
import { useCountPropertiesByAgent } from "./services/query";

const Dashboard = () => {
  const {
    data: countPropertiesByAgent,
    isLoading: isLoadingCountPropertiesByAgent,
  } = useCountPropertiesByAgent();
  const stats: CardStatsProps[] = [
    {
      title: "Total Views",
      value: isLoadingCountPropertiesByAgent
        ? "..."
        : countPropertiesByAgent?.data?.count?.toString() || "0",
      icon: <Eye className="text-blue-800" />,
      color: "blue",
      percentage: 10,
      type: "increase",
    },
    {
      title: "New Leads",
      value: "45",
      icon: <Users className="text-green-800" />,
      color: "green",
      percentage: 5,
      type: "increase",
    },
    {
      title: "Active Listings",
      value: "3",
      icon: <Building2 className="text-purple-800" />,
      color: "purple",
      percentage: 0,
      type: "static",
    },
    {
      title: "Properties sold",
      value: "12",
      icon: <BadgeCheck className="text-orange-800" />,
      color: "orange",
      percentage: 2,
      type: "decrease",
    },
  ];

  return (
    <div className="grid gap-8">
      <div className="grid grid-cols-4 gap-8">
        {stats.map((stat) => (
          <CardStats key={stat.title} {...stat} />
        ))}
      </div>
      <ChartLine />
    </div>
  );
};

export default Dashboard;
