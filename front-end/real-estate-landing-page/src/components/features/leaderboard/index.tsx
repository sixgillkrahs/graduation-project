"use client";

import { usePublicLeaderboard } from "@/components/features/leaderboard/services/query";
import { Avatar } from "@/components/ui/avatar";
import { ROUTES } from "@/const/routes";
import {
  Crown,
  Medal,
  TrendingUp,
  Trophy,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

const MONTH_NAMES_VI = [
  "Tháng 1",
  "Tháng 2",
  "Tháng 3",
  "Tháng 4",
  "Tháng 5",
  "Tháng 6",
  "Tháng 7",
  "Tháng 8",
  "Tháng 9",
  "Tháng 10",
  "Tháng 11",
  "Tháng 12",
];

const MEDAL_CONFIGS = [
  {
    bg: "from-amber-400 to-yellow-500",
    ring: "ring-amber-300/60",
    text: "text-amber-900",
    icon: Crown,
    size: "size-20 md:size-24",
    badge: "bg-gradient-to-r from-amber-400 to-yellow-500 text-white",
  },
  {
    bg: "from-slate-300 to-gray-400",
    ring: "ring-slate-300/50",
    text: "text-slate-800",
    icon: Medal,
    size: "size-16 md:size-20",
    badge: "bg-gradient-to-r from-slate-400 to-gray-500 text-white",
  },
  {
    bg: "from-orange-300 to-amber-600",
    ring: "ring-orange-300/50",
    text: "text-orange-900",
    icon: Medal,
    size: "size-16 md:size-20",
    badge: "bg-gradient-to-r from-orange-400 to-amber-600 text-white",
  },
];

const formatCurrency = (value: number) => {
  if (value >= 1_000_000_000) {
    return `${(value / 1_000_000_000).toFixed(1)} tỷ`;
  }
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(0)} triệu`;
  }
  return new Intl.NumberFormat("vi-VN").format(value);
};

const AgentLeaderboard = () => {
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());

  const { data, isLoading } = usePublicLeaderboard({
    month: selectedMonth,
    year: selectedYear,
    limit: 20,
  });

  const leaderboard = data?.data?.results || [];
  const topThree = leaderboard.slice(0, 3);
  const restOfList = leaderboard.slice(3);

  const handlePrevMonth = () => {
    if (selectedMonth === 1) {
      setSelectedMonth(12);
      setSelectedYear((y) => y - 1);
    } else {
      setSelectedMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    const isCurrentMonth =
      selectedMonth === now.getMonth() + 1 &&
      selectedYear === now.getFullYear();
    if (isCurrentMonth) return;

    if (selectedMonth === 12) {
      setSelectedMonth(1);
      setSelectedYear((y) => y + 1);
    } else {
      setSelectedMonth((m) => m + 1);
    }
  };

  const isCurrentMonth =
    selectedMonth === now.getMonth() + 1 && selectedYear === now.getFullYear();

  const displayPeriod = useMemo(
    () => `${MONTH_NAMES_VI[selectedMonth - 1]}, ${selectedYear}`,
    [selectedMonth, selectedYear],
  );

  return (
    <main className="min-h-screen bg-background text-foreground">
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-border bg-gradient-to-br from-amber-50/80 via-background to-orange-50/60 dark:from-amber-950/20 dark:to-orange-950/10">
        <div className="absolute inset-0 opacity-30 [background-image:radial-gradient(circle_at_25%_25%,rgba(251,191,36,0.15),transparent_50%),radial-gradient(circle_at_75%_75%,rgba(249,115,22,0.1),transparent_50%)]" />
        <div className="absolute inset-0 opacity-20 [background-image:linear-gradient(to_right,color-mix(in_oklab,var(--color-border)_40%,transparent)_1px,transparent_1px),linear-gradient(to_bottom,color-mix(in_oklab,var(--color-border)_40%,transparent)_1px,transparent_1px)] [background-size:40px_40px]" />

        <div className="relative container mx-auto px-4 py-16 md:px-20 md:py-24 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-amber-100 dark:bg-amber-900/40 px-4 py-1.5 text-sm font-semibold text-amber-800 dark:text-amber-300 mb-6 ring-1 ring-amber-200 dark:ring-amber-800">
            <Trophy className="size-4" />
            Bảng xếp hạng môi giới
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight bg-gradient-to-r from-amber-600 via-orange-500 to-red-500 bg-clip-text text-transparent pb-2">
            Top Môi Giới Xuất Sắc
          </h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Bảng xếp hạng doanh thu hàng tháng của các chuyên viên môi giới bất
            động sản hàng đầu trên nền tảng EstateX.
          </p>

          {/* Month Selector */}
          <div className="mt-10 inline-flex items-center gap-3 rounded-2xl border border-border bg-card/80 backdrop-blur-sm px-4 py-2.5 shadow-sm">
            <button
              onClick={handlePrevMonth}
              className="p-1.5 rounded-lg hover:bg-muted transition-colors"
              aria-label="Tháng trước"
            >
              <ChevronLeft className="size-5 text-muted-foreground" />
            </button>
            <span className="text-base font-semibold px-3 min-w-[180px]">
              {displayPeriod}
            </span>
            <button
              onClick={handleNextMonth}
              disabled={isCurrentMonth}
              className="p-1.5 rounded-lg hover:bg-muted transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              aria-label="Tháng sau"
            >
              <ChevronRight className="size-5 text-muted-foreground" />
            </button>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="container mx-auto px-4 py-10 md:px-20 md:py-16">
        {isLoading && (
          <div className="grid gap-6 md:grid-cols-3 mb-12">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="h-64 rounded-3xl bg-muted/50 animate-pulse"
              />
            ))}
          </div>
        )}

        {!isLoading && leaderboard.length === 0 && (
          <div className="text-center py-20 rounded-3xl border border-dashed border-border bg-card">
            <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-amber-50 dark:bg-amber-900/30 text-amber-500 mb-6">
              <Trophy className="size-7" />
            </div>
            <h3 className="text-xl font-semibold mb-2">
              Chưa có dữ liệu xếp hạng
            </h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Bảng xếp hạng cho {displayPeriod} chưa có dữ liệu. Hãy thử chọn
              tháng khác.
            </p>
          </div>
        )}

        {/* Top 3 Podium */}
        {!isLoading && topThree.length > 0 && (
          <div className="mb-16">
            <div className="flex items-center gap-3 mb-8">
              <Sparkles className="size-5 text-amber-500" />
              <h2 className="text-2xl font-bold tracking-tight">
                Top 3 Doanh Thu Cao Nhất
              </h2>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              {/* Reorder: show #2, #1, #3 for podium effect on desktop */}
              {[topThree[1], topThree[0], topThree[2]]
                .filter(Boolean)
                .map((agent, displayIndex) => {
                  const actualRank = agent.rank;
                  const config = MEDAL_CONFIGS[actualRank - 1];
                  const isFirst = actualRank === 1;
                  const Icon = config.icon;

                  return (
                    <Link
                      key={agent.agentUserId}
                      href={ROUTES.AGENT_PUBLIC_PROFILE(agent.agentUserId)}
                      className={`group relative overflow-hidden rounded-3xl border bg-card p-6 text-center transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
                        isFirst
                          ? "border-amber-200 dark:border-amber-800 md:row-start-1 md:-mt-4 shadow-lg shadow-amber-100/50 dark:shadow-amber-900/20"
                          : "border-border hover:border-primary/30"
                      }`}
                    >
                      {/* Decorative gradient */}
                      <div
                        className={`absolute inset-x-0 top-0 h-32 bg-gradient-to-b ${config.bg} opacity-[0.07]`}
                      />

                      <div className="relative">
                        {/* Rank badge */}
                        <div
                          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold mb-4 ${config.badge}`}
                        >
                          <Icon className="size-3.5" />#{actualRank}
                        </div>

                        {/* Avatar */}
                        <div
                          className={`mx-auto ${config.size} rounded-full ring-4 ${config.ring} overflow-hidden bg-primary/10 mb-4`}
                        >
                          <Avatar
                            src={agent.avatarUrl}
                            alt={agent.fullName}
                            className="size-full rounded-full"
                          />
                        </div>

                        {/* Name */}
                        <h3
                          className={`font-bold ${isFirst ? "text-xl" : "text-lg"} tracking-tight group-hover:text-primary transition-colors`}
                        >
                          {agent.fullName}
                        </h3>

                        {/* Revenue */}
                        <p
                          className={`mt-2 text-2xl font-extrabold ${isFirst ? "text-amber-600 dark:text-amber-400" : "text-foreground"}`}
                        >
                          {formatCurrency(agent.revenue)}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          VNĐ doanh thu
                        </p>

                        {/* Deals */}
                        <div className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-green-50 dark:bg-green-900/30 px-3 py-1 text-xs font-semibold text-green-700 dark:text-green-400">
                          <TrendingUp className="size-3.5" />
                          {agent.deals} giao dịch
                        </div>
                      </div>
                    </Link>
                  );
                })}
            </div>
          </div>
        )}

        {/* Rest of list */}
        {!isLoading && restOfList.length > 0 && (
          <div>
            <div className="flex items-center gap-3 mb-6">
              <Medal className="size-5 text-primary" />
              <h2 className="text-xl font-bold tracking-tight">
                Bảng Xếp Hạng Đầy Đủ
              </h2>
            </div>

            <div className="rounded-3xl border border-border bg-card overflow-hidden shadow-sm">
              {/* Header */}
              <div className="grid grid-cols-[60px_1fr_140px_100px] md:grid-cols-[60px_1fr_180px_120px] items-center gap-4 px-6 py-3 border-b border-border bg-muted/30 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <span className="text-center">#</span>
                <span>Môi giới</span>
                <span className="text-right">Doanh thu</span>
                <span className="text-center">Giao dịch</span>
              </div>

              {/* Rows */}
              {restOfList.map((agent, index) => (
                <Link
                  key={agent.agentUserId}
                  href={ROUTES.AGENT_PUBLIC_PROFILE(agent.agentUserId)}
                  className={`grid grid-cols-[60px_1fr_140px_100px] md:grid-cols-[60px_1fr_180px_120px] items-center gap-4 px-6 py-4 transition-colors hover:bg-muted/50 group ${
                    index !== restOfList.length - 1
                      ? "border-b border-border/50"
                      : ""
                  }`}
                >
                  {/* Rank */}
                  <span className="text-center">
                    <span className="inline-flex items-center justify-center size-8 rounded-full bg-muted text-sm font-bold text-muted-foreground">
                      {agent.rank}
                    </span>
                  </span>

                  {/* Agent info */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="size-10 shrink-0 rounded-full overflow-hidden bg-primary/10 ring-2 ring-border">
                      <Avatar
                        src={agent.avatarUrl}
                        alt={agent.fullName}
                        className="size-full rounded-full"
                      />
                    </div>
                    <span className="font-semibold truncate group-hover:text-primary transition-colors">
                      {agent.fullName}
                    </span>
                  </div>

                  {/* Revenue */}
                  <span className="text-right font-bold text-foreground">
                    {formatCurrency(agent.revenue)}
                  </span>

                  {/* Deals */}
                  <span className="text-center">
                    <span className="inline-flex items-center gap-1 rounded-full bg-green-50 dark:bg-green-900/30 px-2.5 py-0.5 text-xs font-semibold text-green-700 dark:text-green-400">
                      {agent.deals}
                    </span>
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </section>
    </main>
  );
};

export default AgentLeaderboard;
