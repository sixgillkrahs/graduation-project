import { Icon } from "@/components/ui";
import CardStats, { CardStatsProps } from "./components/CardStats";
import ChartLine from "./components/ChartLine";

const Dashboard = () => {
  const stats: CardStatsProps[] = [
    {
      title: "Total Views",
      value: "1240",
      icon: <Icon.Eye className="text-blue-800" />,
      color: "blue",
      percentage: 10,
      type: "increase",
    },
    {
      title: "New Leads",
      value: "45",
      icon: <Icon.Group className="text-green-800" />,
      color: "green",
      percentage: 5,
      type: "increase",
    },
    {
      title: "Active Listings",
      value: "3",
      icon: <Icon.Building className="text-purple-800" />,
      color: "purple",
      percentage: 0,
      type: "static",
    },
    {
      title: "Properties sold",
      value: "12",
      icon: <Icon.VerifiedBadge className="text-orange-800" />,
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
