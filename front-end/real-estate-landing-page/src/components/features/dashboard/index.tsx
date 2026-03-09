"use client";

import { Home, Plus, TrendingUp, Users, Wallet } from "lucide-react";
import ChartLine from "./components/ChartLine";
import RecentInquiries from "./components/RecentInquiries";
import SidebarRight from "./components/SidebarRight";
import {
  useCountPropertiesByAgent,
  useCountTotalView,
  useGetRevenueLeaderboard,
  useGetRevenueSummary,
  useGetSchedulesToday,
  useGetSalesLog,
} from "./services/query";
import { formatPropertyPrice } from "@/lib/property-price";
import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";

const Dashboard = () => {
  const t = useTranslations("AgentDashboard");
  const locale = useLocale();
  const [currency, setCurrency] = useState<"VND" | "USD">("VND");
  const {
    data: countPropertiesByAgent,
    isLoading: isLoadingCountPropertiesByAgent,
  } = useCountPropertiesByAgent();

  const { data: countTotalView, isLoading: isLoadingCountTotalView } =
    useCountTotalView();

  const { data: schedulesToday, isLoading: isLoadingSchedulesToday } =
    useGetSchedulesToday();
  const { data: revenueSummary, isLoading: isLoadingRevenueSummary } =
    useGetRevenueSummary(currency);
  const { data: salesLog, isLoading: isLoadingSalesLog } =
    useGetSalesLog(currency, 5);
  const { data: revenueLeaderboard, isLoading: isLoadingRevenueLeaderboard } =
    useGetRevenueLeaderboard(currency, 10);

  const revenueValue = isLoadingRevenueSummary
    ? "..."
    : formatPropertyPrice(
        revenueSummary?.data?.revenue,
        "VND",
        revenueSummary?.data?.currency || currency,
        locale,
      );

  const stats = [
    {
      title: t("stats.monthlyRevenue"),
      value: revenueValue,
      icon: <Wallet className="main-color-red" />,
      color: "red",
      type: "increase",
      label: t("stats.revenue"),
    },
    {
      title: t("stats.closedDeals"),
      value: revenueSummary?.data?.deals?.toString() || "0",
      icon: <Users className="main-color-black" />,
      color: "black",
      type: "increase",
      label: t("stats.sales"),
    },
    {
      title: t("stats.activeListings"),
      value: isLoadingCountPropertiesByAgent
        ? "..."
        : countPropertiesByAgent?.data?.count?.toString() || "0",
      icon: <Home className="main-color-gray" />,
      color: "gray",
      type: "static",
      label: t("stats.listings"),
    },
    {
      title: t("stats.totalViews"),
      value: isLoadingCountTotalView
        ? "..."
        : countTotalView?.data?.totalViews?.toString() || "1.5k",
      icon: <TrendingUp className="main-color-red" />,
      color: "red",
      type: "increase",
      label: t("stats.performance"),
    },
  ];

  return (
    <div className="p-8 bg-white min-h-screen relative font-sans text-slate-900">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="cs-typography font-bold">{t("header.title")}</h1>
          <p className="cs-paragraph-gray mt-1 text-base">
            {t("header.description")}
          </p>
        </div>
        <div className="flex gap-3 items-center">
          <div className="flex rounded-lg border border-gray-200 bg-white p-1">
            {(["VND", "USD"] as const).map((item) => (
              <button
                key={item}
                onClick={() => setCurrency(item)}
                className={`px-3 py-1.5 text-sm rounded-md transition ${
                  currency === item
                    ? "bg-black text-white"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                {item}
              </button>
            ))}
          </div>
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
                {stat.label}
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
          {isLoadingSalesLog ? (
            <div className="bg-white p-6 rounded-2xl shadow-sm border cs-outline-gray">
              {t("sales.loading")}
            </div>
          ) : (
            <RecentInquiries sales={salesLog?.data?.results || []} />
          )}
        </div>

        {/* Sidebar (Span 1) */}
        <div className="lg:col-span-1">
          <SidebarRight
            schedules={(schedulesToday as any)?.data || []}
            leaderboard={revenueLeaderboard?.data?.results || []}
            currency={currency}
          />
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
