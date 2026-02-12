"use client";

import { Home, Plus, TrendingUp, Users, Wallet } from "lucide-react";
import ChartLine from "./components/ChartLine";
import RecentInquiries from "./components/RecentInquiries";
import SidebarRight from "./components/SidebarRight";
import {
  useCountPropertiesByAgent,
  useCountSoldPropertiesByAgent,
  useCountTotalView,
  useGetSchedulesToday,
} from "./services/query";

const Dashboard = () => {
  const {
    data: countPropertiesByAgent,
    isLoading: isLoadingCountPropertiesByAgent,
  } = useCountPropertiesByAgent();

  const { data: countTotalView, isLoading: isLoadingCountTotalView } =
    useCountTotalView();

  const { data: schedulesToday, isLoading: isLoadingSchedulesToday } =
    useGetSchedulesToday();

  const stats = [
    {
      title: "Est. Commission",
      value: "45M VND",
      icon: <Wallet className="main-color-red" />,
      color: "red",
      // percentage: 12,
      type: "increase",
      label: "Revenue",
    },
    {
      title: "New Leads",
      value: "28",
      icon: <Users className="main-color-black" />,
      color: "black",
      // percentage: 5,
      type: "increase",
      label: "Leads",
    },
    {
      title: "Active Listings",
      value: isLoadingCountPropertiesByAgent
        ? "..."
        : countPropertiesByAgent?.data?.count?.toString() || "0",
      icon: <Home className="main-color-gray" />,
      color: "gray",
      // percentage: 0,
      type: "static",
      label: "Listings",
    },
    {
      title: "Total Views",
      value: isLoadingCountTotalView
        ? "..."
        : countTotalView?.data?.totalViews?.toString() || "1.5k",
      icon: <TrendingUp className="main-color-red" />,
      color: "red",
      // percentage: 8,
      type: "increase",
      label: "Performance",
    },
  ];

  return (
    <div className="p-8 bg-white min-h-screen relative font-sans text-slate-900">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="cs-typography font-bold">Agent Command Center</h1>
          <p className="cs-paragraph-gray mt-1 text-base">
            Welcome back, here's what's happening today.
          </p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-white cs-outline-gray text-slate-700 font-medium rounded-lg hover:bg-gray-50 transition-colors shadow-sm">
            Export Report
          </button>
          <button className="px-4 py-2 cs-bg-black text-white font-medium rounded-lg hover:bg-gray-800 transition-colors shadow-sm">
            Settings
          </button>
        </div>
      </div>

      {/* Row 1: KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="bg-white p-6 rounded-2xl shadow-sm cs-outline-gray flex flex-col justify-between hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-gray-50 rounded-xl">{stat.icon}</div>
              {/* Badge logic customized for new colors */}
              <span
                className={`text-xs font-semibold px-2 py-1 rounded-full ${
                  stat.type === "increase"
                    ? "bg-red-50 main-color-red"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                {stat.type === "increase" ? "+12%" : "0%"}
              </span>
            </div>
            <div>
              <p className="text-sm font-medium cs-paragraph-gray mb-1">
                {stat.title}
              </p>
              <h3 className="text-2xl font-bold cs-typography">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Row 2 & 3: Main Content + Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content (Span 2) */}
        <div className="lg:col-span-2 space-y-8">
          <ChartLine />
          <RecentInquiries />
        </div>

        {/* Sidebar (Span 1) */}
        <div className="lg:col-span-1">
          <SidebarRight schedules={(schedulesToday as any)?.data || []} />
        </div>
      </div>

      {/* FAB */}
      <button className="fixed bottom-8 right-8 cs-bg-red hover:bg-red-700 text-white rounded-full px-6 py-4 shadow-xl shadow-red-200 flex items-center gap-2 transform hover:scale-105 transition-all z-50 font-semibold text-lg">
        <Plus size={24} />
        Add Listing
      </button>
    </div>
  );
};

export default Dashboard;
