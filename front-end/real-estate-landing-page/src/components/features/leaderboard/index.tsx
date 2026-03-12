"use client";

import { useGetMe } from "@/shared/auth/query";
import { useCreateConversation } from "@/components/features/message/services/mutate";
import { usePublicLeaderboard } from "@/components/features/leaderboard/services/query";
import type { LeaderboardEntry } from "@/components/features/leaderboard/services/service";
import { Avatar } from "@/components/ui/avatar";
import { ROUTES } from "@/const/routes";
import { useAppDispatch } from "@/lib/hooks";
import { showAuthDialog } from "@/store/auth-dialog.store";
import { openConversation } from "@/store/chat.store";
import {
  Award,
  BadgeCheck,
  ChevronLeft,
  ChevronRight,
  Crown,
  MapPin,
  MessageSquare,
  Search,
  Star,
  Trophy,
} from "lucide-react";
import { useLocale } from "next-intl";
import Link from "next/link";
import { useMemo, useRef, useState } from "react";

type SortOption = "highestRated" | "topDeals" | "monthlyRevenue" | "topRank";
type ExperienceFilter = "all" | "0-2" | "3-5" | "6+";

const PAGE_SIZE = 9;

const podiumOrder = [1, 0, 2];

const COPY = {
  en: {
    hero: {
      eyebrow: "Trusted Directory",
      title: "Find Your Trusted Real Estate Expert",
      description:
        "Search a premium directory of active agents, compare trust signals, and shortlist the right expert for your next move.",
      searchPlaceholder: "Search by name or location...",
      specialtyAll: "All specialties",
      areaAll: "All markets",
      minRatingAll: "Any rating",
      minRatingLabel: "Minimum rating",
      experienceAll: "Any experience",
      experienceLabel: "Experience",
      experience0to2: "0 to 2 years",
      experience3to5: "3 to 5 years",
      experience6plus: "6+ years",
      proOnly: "PRO agents only",
      searchAction: "Search",
      resetAction: "Reset",
    },
    top: {
      eyebrow: "Elite Agents",
      title: "Top Performing Agents of the Month",
      previousMonth: "Previous month",
      nextMonth: "Next month",
      proBadge: "PRO Agent",
      viewProfile: "View Profile",
      badges: {
        first: "#1 Top Seller",
        second: "#2",
        third: "#3",
      },
    },
    directory: {
      title: "All Agents",
      sortLabel: "Sort by:",
      sort: {
        highestRated: "Highest Rated",
        topDeals: "Most Deals Closed",
        monthlyRevenue: "Highest Revenue",
        topRank: "Top Seller Rank",
      },
      fallbackLocation: "Location updating",
      profileAction: "Profile",
      messageAction: "Message",
      authTitle: "Login to message an agent",
      authDescription:
        "Please login to start a conversation with this agent.",
      emptyTitle: "No agents matched your search",
      emptyDescription:
        "Try a broader location, a different name, or reset the selected specialty.",
    },
    pagination: {
      previous: "Previous",
      next: "Next",
    },
  },
  vi: {
    hero: {
      eyebrow: "Danh bạ uy tín",
      title: "Tìm đúng môi giới bất động sản đáng tin cậy",
      description:
        "Tìm kiếm danh bạ môi giới đang hoạt động mạnh, so sánh độ tin cậy và chọn đúng người đồng hành cho giao dịch của bạn.",
      searchPlaceholder: "Tìm theo tên hoặc khu vực...",
      specialtyAll: "Tất cả chuyên môn",
      areaAll: "Tất cả khu vực",
      minRatingAll: "Mọi mức đánh giá",
      minRatingLabel: "Đánh giá tối thiểu",
      experienceAll: "Mọi mức kinh nghiệm",
      experienceLabel: "Kinh nghiệm",
      experience0to2: "0 đến 2 năm",
      experience3to5: "3 đến 5 năm",
      experience6plus: "6+ năm",
      proOnly: "Chỉ hiển thị PRO",
      searchAction: "Tìm kiếm",
      resetAction: "Đặt lại",
    },
    top: {
      eyebrow: "Môi giới xuất sắc",
      title: "Top môi giới có thành tích tốt nhất tháng này",
      previousMonth: "Tháng trước",
      nextMonth: "Tháng sau",
      proBadge: "PRO Agent",
      viewProfile: "Xem hồ sơ",
      badges: {
        first: "#1 Top Seller",
        second: "#2",
        third: "#3",
      },
    },
    directory: {
      title: "Tất cả môi giới",
      sortLabel: "Sắp xếp theo:",
      sort: {
        highestRated: "Đánh giá cao nhất",
        topDeals: "Nhiều giao dịch nhất",
        monthlyRevenue: "Doanh thu cao nhất",
        topRank: "Top seller rank",
      },
      fallbackLocation: "Đang cập nhật khu vực",
      profileAction: "Hồ sơ",
      messageAction: "Nhắn tin",
      authTitle: "Đăng nhập để nhắn tin với môi giới",
      authDescription:
        "Vui lòng đăng nhập để bắt đầu cuộc trò chuyện với môi giới này.",
      emptyTitle: "Không tìm thấy môi giới phù hợp",
      emptyDescription:
        "Thử mở rộng khu vực tìm kiếm, đổi tên môi giới hoặc đặt lại chuyên môn.",
    },
    pagination: {
      previous: "Trước",
      next: "Sau",
    },
  },
} as const;

const formatMonthPeriod = (month: number, year: number, locale: string) =>
  new Intl.DateTimeFormat(locale, { month: "long", year: "numeric" }).format(
    new Date(year, month - 1, 1),
  );

const formatCompactCurrency = (
  value: number,
  locale: string,
  currency: string,
) =>
  new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);

const getTopBadge = (
  rank: number,
  copy: (typeof COPY)["en"] | (typeof COPY)["vi"],
) => {
  if (rank === 1) return copy.top.badges.first;
  if (rank === 2) return copy.top.badges.second;
  return copy.top.badges.third;
};

const AgentDirectory = () => {
  const locale = useLocale();
  const copy = locale.toLowerCase().startsWith("vi") ? COPY.vi : COPY.en;
  const localeTag = locale.toLowerCase().startsWith("vi") ? "vi-VN" : "en-US";
  const dispatch = useAppDispatch();
  const directoryRef = useRef<HTMLDivElement>(null);
  const now = new Date();

  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [draftQuery, setDraftQuery] = useState("");
  const [draftSpecialty, setDraftSpecialty] = useState("all");
  const [draftArea, setDraftArea] = useState("all");
  const [draftMinRating, setDraftMinRating] = useState("all");
  const [draftExperience, setDraftExperience] =
    useState<ExperienceFilter>("all");
  const [draftProOnly, setDraftProOnly] = useState(false);
  const [appliedQuery, setAppliedQuery] = useState("");
  const [appliedSpecialty, setAppliedSpecialty] = useState("all");
  const [appliedArea, setAppliedArea] = useState("all");
  const [appliedMinRating, setAppliedMinRating] = useState("all");
  const [appliedExperience, setAppliedExperience] =
    useState<ExperienceFilter>("all");
  const [appliedProOnly, setAppliedProOnly] = useState(false);
  const [sortOption, setSortOption] = useState<SortOption>("highestRated");
  const [currentPage, setCurrentPage] = useState(1);

  const { data, isLoading } = usePublicLeaderboard({
    month: selectedMonth,
    year: selectedYear,
    limit: 48,
  });
  const { data: me } = useGetMe();
  const { mutateAsync: createConversation, isPending: isCreatingConversation } =
    useCreateConversation();

  const leaderboard = data?.data?.results || [];
  const currency = data?.data?.currency || "VND";
  const isCurrentMonth =
    selectedMonth === now.getMonth() + 1 && selectedYear === now.getFullYear();

  const specialtyOptions = useMemo(() => {
    const unique = new Set<string>();
    leaderboard.forEach((agent) => {
      (agent.specialties || []).forEach((specialty) => {
        if (specialty?.trim()) unique.add(specialty.trim());
      });
    });
    return Array.from(unique).sort((left, right) => left.localeCompare(right));
  }, [leaderboard]);

  const areaOptions = useMemo(() => {
    const unique = new Set<string>();
    leaderboard.forEach((agent) => {
      (agent.workingAreas || []).forEach((area) => {
        if (area?.trim()) unique.add(area.trim());
      });
    });
    return Array.from(unique).sort((left, right) => left.localeCompare(right));
  }, [leaderboard]);

  const topAgents = useMemo(
    () => [...leaderboard].sort((left, right) => left.rank - right.rank).slice(0, 3),
    [leaderboard],
  );

  const filteredAgents = useMemo(() => {
    const normalizedQuery = appliedQuery.trim().toLowerCase();
    let results = leaderboard.filter((agent) => {
      const matchesQuery =
        !normalizedQuery ||
        [
          agent.fullName,
          agent.primaryWorkingArea || "",
          ...(agent.workingAreas || []),
        ]
          .join(" ")
          .toLowerCase()
          .includes(normalizedQuery);

      const matchesSpecialty =
        appliedSpecialty === "all" ||
        (agent.specialties || []).some(
          (specialty) => specialty.toLowerCase() === appliedSpecialty.toLowerCase(),
        );

      const matchesArea =
        appliedArea === "all" ||
        (agent.workingAreas || []).some(
          (area) => area.toLowerCase() === appliedArea.toLowerCase(),
        );

      const matchesRating =
        appliedMinRating === "all" ||
        agent.rating >= Number(appliedMinRating);

      const numericExperience = Number(agent.yearsOfExperience || 0);
      const matchesExperience =
        appliedExperience === "all" ||
        (appliedExperience === "0-2" && numericExperience <= 2) ||
        (appliedExperience === "3-5" &&
          numericExperience >= 3 &&
          numericExperience <= 5) ||
        (appliedExperience === "6+" && numericExperience >= 6);

      const matchesPro = !appliedProOnly || agent.isPro;

      return (
        matchesQuery &&
        matchesSpecialty &&
        matchesArea &&
        matchesRating &&
        matchesExperience &&
        matchesPro
      );
    });

    results = [...results].sort((left, right) => {
      if (sortOption === "topDeals") {
        return right.deals - left.deals || left.rank - right.rank;
      }

      if (sortOption === "monthlyRevenue") {
        return right.revenue - left.revenue || left.rank - right.rank;
      }

      if (sortOption === "topRank") {
        return left.rank - right.rank || right.rating - left.rating;
      }

      return (
        right.rating - left.rating ||
        right.reviewCount - left.reviewCount ||
        left.rank - right.rank
      );
    });

    return results;
  }, [
    appliedArea,
    appliedExperience,
    appliedMinRating,
    appliedProOnly,
    appliedQuery,
    appliedSpecialty,
    leaderboard,
    sortOption,
  ]);

  const totalPages = Math.max(1, Math.ceil(filteredAgents.length / PAGE_SIZE));
  const currentPageSafe = Math.min(currentPage, totalPages);
  const paginatedAgents = filteredAgents.slice(
    (currentPageSafe - 1) * PAGE_SIZE,
    currentPageSafe * PAGE_SIZE,
  );

  const visiblePages = useMemo(
    () => Array.from({ length: totalPages }, (_, index) => index + 1),
    [totalPages],
  );

  const displayPeriod = useMemo(
    () => formatMonthPeriod(selectedMonth, selectedYear, localeTag),
    [localeTag, selectedMonth, selectedYear],
  );

  const handlePrevMonth = () => {
    if (selectedMonth === 1) {
      setSelectedMonth(12);
      setSelectedYear((year) => year - 1);
      return;
    }

    setSelectedMonth((month) => month - 1);
  };

  const handleNextMonth = () => {
    if (isCurrentMonth) return;

    if (selectedMonth === 12) {
      setSelectedMonth(1);
      setSelectedYear((year) => year + 1);
      return;
    }

    setSelectedMonth((month) => month + 1);
  };

  const handleSearch = () => {
    setAppliedQuery(draftQuery.trim());
    setAppliedSpecialty(draftSpecialty);
    setAppliedArea(draftArea);
    setAppliedMinRating(draftMinRating);
    setAppliedExperience(draftExperience);
    setAppliedProOnly(draftProOnly);
    setCurrentPage(1);
    directoryRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleResetFilters = () => {
    setDraftQuery("");
    setDraftSpecialty("all");
    setDraftArea("all");
    setDraftMinRating("all");
    setDraftExperience("all");
    setDraftProOnly(false);
    setAppliedQuery("");
    setAppliedSpecialty("all");
    setAppliedArea("all");
    setAppliedMinRating("all");
    setAppliedExperience("all");
    setAppliedProOnly(false);
    setCurrentPage(1);
  };

  const handleMessageAgent = async (agentUserId: string) => {
    if (!me?.data?.userId) {
      dispatch(
        showAuthDialog({
          title: copy.directory.authTitle,
          description: copy.directory.authDescription,
          redirectUrl: ROUTES.LEADERBOARD,
        }),
      );
      return;
    }

    const res = await createConversation([agentUserId]);
    if (res?.data) {
      dispatch(openConversation(res.data));
    }
  };

  return (
    <main className="min-h-screen bg-background text-foreground">
      <section
        className="border-b border-border"
        style={{
          background:
            "linear-gradient(180deg, color-mix(in oklab, var(--color-primary) 5%, white) 0%, color-mix(in oklab, var(--color-red) 5%, white) 100%)",
        }}
      >
        <div className="container mx-auto px-4 py-16 md:px-20 md:py-20">
          <div className="mx-auto max-w-4xl text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[var(--color-red)]">
              {copy.hero.eyebrow}
            </p>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight text-foreground md:text-6xl">
              {copy.hero.title}
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-muted-foreground md:text-lg">
              {copy.hero.description}
            </p>
          </div>

          <div className="mx-auto mt-10 max-w-5xl rounded-[32px] border border-border bg-card p-4 shadow-[0_24px_70px_-40px_rgba(12,12,18,0.22)] md:p-5">
            <div className="grid gap-3 md:grid-cols-[minmax(0,1.2fr)_240px_180px]">
              <label className="flex items-center gap-3 rounded-2xl border border-border bg-background px-4 py-3">
                <Search className="size-5 text-[var(--color-red)]" />
                <input
                  value={draftQuery}
                  onChange={(event) => setDraftQuery(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") handleSearch();
                  }}
                  placeholder={copy.hero.searchPlaceholder}
                  className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
                />
              </label>

              <select
                value={draftSpecialty}
                onChange={(event) => setDraftSpecialty(event.target.value)}
                className="h-[52px] rounded-2xl border border-border bg-background px-4 text-sm font-medium text-foreground outline-none"
              >
                <option value="all">{copy.hero.specialtyAll}</option>
                {specialtyOptions.map((specialty) => (
                  <option key={specialty} value={specialty}>
                    {specialty}
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={handleSearch}
                className="h-[52px] rounded-2xl bg-primary px-5 text-sm font-semibold text-primary-foreground transition hover:opacity-95"
              >
                {copy.hero.searchAction}
              </button>
            </div>

            <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-[220px_190px_190px_auto_auto]">
              <select
                value={draftArea}
                onChange={(event) => setDraftArea(event.target.value)}
                className="h-[52px] rounded-2xl border border-border bg-background px-4 text-sm font-medium text-foreground outline-none"
              >
                <option value="all">{copy.hero.areaAll}</option>
                {areaOptions.map((area) => (
                  <option key={area} value={area}>
                    {area}
                  </option>
                ))}
              </select>

              <select
                value={draftMinRating}
                onChange={(event) => setDraftMinRating(event.target.value)}
                className="h-[52px] rounded-2xl border border-border bg-background px-4 text-sm font-medium text-foreground outline-none"
              >
                <option value="all">{copy.hero.minRatingAll}</option>
                <option value="4.5">{`${copy.hero.minRatingLabel}: 4.5+`}</option>
                <option value="4">{`${copy.hero.minRatingLabel}: 4.0+`}</option>
                <option value="3.5">{`${copy.hero.minRatingLabel}: 3.5+`}</option>
              </select>

              <select
                value={draftExperience}
                onChange={(event) =>
                  setDraftExperience(event.target.value as ExperienceFilter)
                }
                className="h-[52px] rounded-2xl border border-border bg-background px-4 text-sm font-medium text-foreground outline-none"
              >
                <option value="all">{copy.hero.experienceAll}</option>
                <option value="0-2">{copy.hero.experience0to2}</option>
                <option value="3-5">{copy.hero.experience3to5}</option>
                <option value="6+">{copy.hero.experience6plus}</option>
              </select>

              <label className="inline-flex h-[52px] items-center justify-center gap-3 rounded-2xl border border-border bg-background px-4 text-sm font-medium text-foreground">
                <input
                  type="checkbox"
                  checked={draftProOnly}
                  onChange={(event) => setDraftProOnly(event.target.checked)}
                  className="size-4 rounded border-border accent-[var(--color-red)]"
                />
                <span>{copy.hero.proOnly}</span>
              </label>

              <button
                type="button"
                onClick={handleResetFilters}
                className="h-[52px] rounded-2xl border border-border bg-background px-5 text-sm font-semibold text-foreground transition hover:bg-accent"
              >
                {copy.hero.resetAction}
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 pt-12 md:px-20 md:pt-16">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#b68711]">
              {copy.top.eyebrow}
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
              {copy.top.title}
            </h2>
          </div>

          <div className="flex items-center gap-3 self-start rounded-full border border-[#f4d98d] bg-[#fff9e8] px-4 py-2 text-sm font-medium text-[#8b6508]">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="rounded-full p-1 transition hover:bg-black/5"
              aria-label={copy.top.previousMonth}
            >
              <ChevronLeft className="size-4" />
            </button>
            <span>{displayPeriod}</span>
            <button
              type="button"
              onClick={handleNextMonth}
              disabled={isCurrentMonth}
              className="rounded-full p-1 transition hover:bg-black/5 disabled:opacity-35"
              aria-label={copy.top.nextMonth}
            >
              <ChevronRight className="size-4" />
            </button>
          </div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          {podiumOrder.map((index) => {
            const agent = topAgents[index];
            if (!agent) return null;

            const isChampion = agent.rank === 1;

            return (
              <article
                key={agent.agentUserId}
                className={`relative overflow-hidden rounded-[32px] border bg-card p-6 shadow-sm ${
                  isChampion
                    ? "lg:-mt-4 lg:scale-[1.02]"
                    : ""
                }`}
                style={{
                  borderColor: "#f2d37a",
                  boxShadow: isChampion
                    ? "0 24px 60px -32px rgba(182,135,17,0.4)"
                    : "0 20px 45px -36px rgba(182,135,17,0.28)",
                  background:
                    "linear-gradient(180deg, rgba(255,249,232,0.92) 0%, rgba(255,255,255,1) 42%)",
                }}
              >
                <div className="absolute right-0 top-0 rounded-bl-2xl bg-[#e6b93f] px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-[#1f1a0a]">
                  {getTopBadge(agent.rank, copy)}
                </div>

                <div className="flex flex-col items-center text-center">
                  <div className="flex size-20 items-center justify-center rounded-full bg-white shadow-sm ring-4 ring-[#f6e6b8]">
                    <Avatar
                      src={agent.avatarUrl}
                      alt={agent.fullName}
                      className="size-full rounded-full"
                    />
                  </div>

                  <h3 className="mt-5 text-2xl font-semibold tracking-tight text-foreground">
                    {agent.fullName}
                  </h3>
                  <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-black px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-white">
                    {isChampion ? <Crown className="size-3.5" /> : <Award className="size-3.5" />}
                    {copy.top.proBadge}
                  </div>

                  <div className="mt-5 space-y-2 text-sm text-muted-foreground">
                    <p className="inline-flex items-center justify-center gap-2 font-medium text-foreground">
                      <Star className="size-4 fill-[#f3c94f] text-[#f3c94f]" />
                      {`${agent.rating.toFixed(1)} ${locale.startsWith("vi") ? "sao" : "star"} (${agent.reviewCount} ${locale.startsWith("vi") ? "đánh giá" : "reviews"})`}
                    </p>
                    <p className="font-medium text-foreground">
                      {locale.startsWith("vi")
                        ? `${agent.deals} giao dịch chốt`
                        : `${agent.deals} deals closed`}
                    </p>
                  </div>

                  <Link
                    href={ROUTES.AGENT_PUBLIC_PROFILE(agent.agentUserId)}
                    className="mt-6 inline-flex w-full items-center justify-center rounded-2xl bg-[var(--color-black)] px-4 py-3 text-sm font-semibold text-[var(--color-white)] transition hover:opacity-95"
                  >
                    {copy.top.viewProfile}
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section ref={directoryRef} className="container mx-auto px-4 py-14 md:px-20 md:py-16">
        <div className="flex flex-col gap-4 border-b border-border pb-6 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-3xl font-semibold tracking-tight text-foreground">
              {copy.directory.title}
            </h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {locale.startsWith("vi")
                ? `${filteredAgents.length} môi giới trong kỳ ${displayPeriod}`
                : `${filteredAgents.length} agents available for ${displayPeriod}`}
            </p>
          </div>

          <label className="flex items-center gap-3 self-start rounded-2xl border border-border bg-card px-4 py-3 text-sm text-muted-foreground">
            <span className="font-medium text-foreground">{copy.directory.sortLabel}</span>
            <select
              value={sortOption}
              onChange={(event) => {
                setSortOption(event.target.value as SortOption);
                setCurrentPage(1);
              }}
              className="bg-transparent font-medium text-foreground outline-none"
            >
              <option value="highestRated">{copy.directory.sort.highestRated}</option>
              <option value="topDeals">{copy.directory.sort.topDeals}</option>
              <option value="monthlyRevenue">{copy.directory.sort.monthlyRevenue}</option>
              <option value="topRank">{copy.directory.sort.topRank}</option>
            </select>
          </label>
        </div>

        {!isLoading && filteredAgents.length === 0 && (
          <div className="mt-8 rounded-[28px] border border-dashed border-border bg-card px-6 py-14 text-center shadow-sm">
            <Search className="mx-auto size-8 text-[var(--color-red)]" />
            <h3 className="mt-4 text-xl font-semibold text-foreground">
              {copy.directory.emptyTitle}
            </h3>
            <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-muted-foreground">
              {copy.directory.emptyDescription}
            </p>
          </div>
        )}

        {isLoading && (
          <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={`directory-loading-${index + 1}`}
                className="h-72 animate-pulse rounded-[28px] bg-muted"
              />
            ))}
          </div>
        )}

        {!isLoading && paginatedAgents.length > 0 && (
          <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {paginatedAgents.map((agent) => (
              <article
                key={agent.agentUserId}
                className="rounded-[28px] border border-border bg-card p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-[0_20px_45px_-30px_rgba(12,12,18,0.22)]"
              >
                <div className="flex items-start gap-4">
                  <div className="size-16 shrink-0 overflow-hidden rounded-full bg-muted ring-2 ring-border">
                    <Avatar
                      src={agent.avatarUrl}
                      alt={agent.fullName}
                      className="size-full rounded-full"
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start gap-2">
                      <h3 className="line-clamp-2 text-xl font-semibold tracking-tight text-foreground">
                        {agent.fullName}
                      </h3>
                      <BadgeCheck className="mt-1 size-4 shrink-0 text-sky-500" />
                    </div>

                    <p className="mt-2 inline-flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="size-4 text-[var(--color-red)]" />
                      {agent.primaryWorkingArea || copy.directory.fallbackLocation}
                    </p>

                    <p className="mt-2 inline-flex items-center gap-2 text-sm font-medium text-foreground">
                      <Star className="size-4 fill-[#f3c94f] text-[#f3c94f]" />
                      {`${agent.rating.toFixed(1)} ${locale.startsWith("vi") ? "sao" : "star"} (${agent.reviewCount} ${locale.startsWith("vi") ? "đánh giá" : "reviews"})`}
                    </p>
                  </div>
                </div>

                <div className="mt-5 flex min-h-[56px] flex-wrap gap-2">
                  {(agent.specialties || []).slice(0, 2).map((specialty) => (
                    <span
                      key={`${agent.agentUserId}-${specialty}`}
                      className="inline-flex items-center rounded-full border border-border bg-muted/40 px-3 py-1.5 text-xs font-medium text-muted-foreground"
                    >
                      {specialty}
                    </span>
                  ))}
                </div>

                <div className="mt-6 flex items-center gap-3">
                  <Link
                    href={ROUTES.AGENT_PUBLIC_PROFILE(agent.agentUserId)}
                    className="inline-flex flex-1 items-center justify-center rounded-2xl border border-primary px-4 py-3 text-sm font-semibold text-primary transition hover:bg-primary hover:text-primary-foreground"
                  >
                    {copy.directory.profileAction}
                  </Link>
                  <button
                    type="button"
                    onClick={() => handleMessageAgent(agent.agentUserId)}
                    disabled={isCreatingConversation}
                    className="inline-flex items-center justify-center rounded-2xl border border-border bg-background px-4 py-3 text-foreground transition hover:bg-accent disabled:opacity-50"
                    aria-label={copy.directory.messageAction}
                  >
                    <MessageSquare className="size-5" />
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}

        {!isLoading && filteredAgents.length > PAGE_SIZE && (
          <div className="mt-10 flex flex-wrap items-center justify-center gap-2 text-sm">
            <button
              type="button"
              onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
              disabled={currentPageSafe === 1}
              className="rounded-full border border-border px-4 py-2 font-medium text-foreground transition hover:bg-accent disabled:opacity-40"
            >
              {copy.pagination.previous}
            </button>

            {visiblePages.map((page) => (
              <button
                key={`page-${page}`}
                type="button"
                onClick={() => setCurrentPage(page)}
                className={`rounded-full px-4 py-2 font-medium transition ${
                  page === currentPageSafe
                    ? "bg-primary text-primary-foreground"
                    : "border border-border text-foreground hover:bg-accent"
                }`}
              >
                {page}
              </button>
            ))}

            <button
              type="button"
              onClick={() =>
                setCurrentPage((page) => Math.min(totalPages, page + 1))
              }
              disabled={currentPageSafe === totalPages}
              className="rounded-full border border-border px-4 py-2 font-medium text-foreground transition hover:bg-accent disabled:opacity-40"
            >
              {copy.pagination.next}
            </button>
          </div>
        )}
      </section>
    </main>
  );
};

export default AgentDirectory;
