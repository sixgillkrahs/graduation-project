"use client";

import { CsButton } from "@/components/custom";
import { useAgentPublicProfile } from "@/components/features/agent-public-profile/services/query";
import { useCreateConversation } from "@/components/features/message/services/mutate";
import PropertyCard from "@/components/features/properties/components/PropertyCard";
import PropertyCardSkeleton from "@/components/features/properties/components/PropertyCardSkeleton";
import { useAgentOnSaleProperties } from "@/components/features/properties/services/query";
import { useGetPublicAgentReviews } from "@/components/features/reviews/services/query";
import { Avatar } from "@/components/ui/avatar";
import bgImage from "@/assets/images/bg.jpg";
import { ROUTES } from "@/const/routes";
import { useAppDispatch } from "@/lib/hooks";
import { formatPropertyPrice } from "@/lib/property-price";
import { openConversation } from "@/store/chat.store";
import { showAuthDialog } from "@/store/auth-dialog.store";
import DOMPurify from "dompurify";
import { useLocale, useTranslations } from "next-intl";
import {
  ArrowUpRight,
  BadgeCheck,
  Building2,
  CheckCircle2,
  LoaderCircle,
  MapPin,
  MessageSquare,
  Phone,
  ShieldCheck,
  Star,
  Trophy,
} from "lucide-react";
import { useParams } from "next/navigation";
import { useState } from "react";
import { useGetMe } from "@/shared/auth/query";

const ReviewStars = ({
  rating,
  size = 16,
}: {
  rating: number;
  size?: number;
}) => {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, index) => (
        <Star
          key={`public-review-star-${index + 1}`}
          size={size}
          className={
            index < rating
              ? "fill-[var(--color-rating-star)] text-[var(--color-rating-star)]"
              : "fill-transparent text-muted-foreground"
          }
        />
      ))}
    </div>
  );
};

const formatReviewDate = (value?: string | Date) => {
  if (!value) {
    return "--";
  }

  return new Date(value).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const AgentPublicProfile = () => {
  const t = useTranslations("AgentPublicProfile");
  const locale = useLocale();
  const localeTag = locale.toLowerCase().startsWith("vi") ? "vi-VN" : "en-US";
  const params = useParams();
  const agentId = params?.id as string;
  const dispatch = useAppDispatch();
  const [isPhoneVisible, setIsPhoneVisible] = useState(false);
  const { data: me } = useGetMe();
  const { data: profileData } = useAgentPublicProfile(agentId);
  const { data: publicReviewsData, isLoading: isLoadingPublicReviews } =
    useGetPublicAgentReviews(agentId, {
      page: 1,
      limit: 6,
    });
  const { data: activeListingsData, isLoading: isLoadingActiveListings } =
    useAgentOnSaleProperties(agentId, {
      page: 1,
      limit: 4,
    });
  const { mutateAsync: createConversation, isPending: isCreatingConversation } =
    useCreateConversation();

  const fallbackAgent = {
    name: t("fallback.name"),
    role: t("fallback.role"),
    location: t("fallback.location"),
    phone: t("fallback.phone"),
    about: t("fallback.about"),
    specialties: [
      t("fallback.specialty1"),
      t("fallback.specialty2"),
      t("fallback.specialty3"),
    ],
    stats: {
      rating: 4.8,
      reviews: 0,
      listings: 0,
    },
  };

  const activeListings = activeListingsData?.data?.results || [];
  const profile = profileData?.data;
  const isClientLoggedIn = Boolean(me?.data?.userId);
  const displayName =
    profile?.fullName ||
    activeListings[0]?.userId?.fullName ||
    fallbackAgent.name;
  const displayRole = profile?.role || fallbackAgent.role;
  const displayLocation =
    profile?.location || profile?.workingAreas?.[0] || fallbackAgent.location;
  const displayPhone = profile?.phone || fallbackAgent.phone;
  const displaySpecialties = profile?.specialties?.length
    ? profile.specialties
    : fallbackAgent.specialties;
  const displayAvatar =
    profile?.avatarUrl || activeListings[0]?.userId?.avatarUrl || "";
  const displayRating = profile?.rating ?? fallbackAgent.stats.rating;
  const reviewsSummary = publicReviewsData?.data?.summary;
  const publicReviews = publicReviewsData?.data?.results || [];
  const totalPublishedReviews =
    reviewsSummary?.totalReviews ?? fallbackAgent.stats.reviews;
  const activeListingsCount =
    activeListingsData?.data?.totalResults != null
      ? Number(activeListingsData.data.totalResults)
      : (profile?.stats.activeSaleListingsCount ??
        fallbackAgent.stats.listings);
  const displayInitials = displayName
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0])
    .join("");
  const aboutText = profile?.description
    ? profile.description
    : profile
      ? t("about.generated", {
          name: displayName,
          years: profile.yearsOfExperience || "0",
          specialties: displaySpecialties.join(", "),
          areas: profile.workingAreas.length
            ? t("about.areaSuffix", {
                areas: profile.workingAreas.join(", "),
              })
            : "",
        })
      : fallbackAgent.about;
  const sanitizedAboutHtml = DOMPurify.sanitize(aboutText);

  const openLoginDialog = (mode: "phone" | "message") => {
    dispatch(
      showAuthDialog({
        title: mode === "phone" ? t("auth.phoneTitle") : t("auth.messageTitle"),
        description:
          mode === "phone"
            ? t("auth.phoneDescription")
            : t("auth.messageDescription"),
        redirectUrl: ROUTES.AGENT_PUBLIC_PROFILE(agentId),
      }),
    );
  };

  const handleRevealPhone = () => {
    if (!isClientLoggedIn) {
      openLoginDialog("phone");
      return;
    }

    setIsPhoneVisible(true);
  };

  const handleOpenConversation = async () => {
    if (!isClientLoggedIn) {
      openLoginDialog("message");
      return;
    }

    const participantId = profile?.userId || agentId;
    if (!participantId) {
      return;
    }

    const res = await createConversation([participantId]);
    if (res.data) {
      dispatch(openConversation(res.data));
    }
  };

  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="border-b border-border bg-gradient-to-br from-primary/10 via-background to-primary/5">
        <div className="container mx-auto px-4 md:px-20 pt-10 pb-8">
          <div className="relative overflow-hidden rounded-[32px] border border-border/60 bg-card shadow-[0_24px_80px_-40px_rgba(0,0,0,0.25)]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.7),transparent_30%),linear-gradient(135deg,rgba(255,255,255,0.75),transparent_55%)]" />
            <div className="absolute inset-0 opacity-50 [background-image:linear-gradient(to_right,color-mix(in_oklab,var(--color-border)_55%,transparent)_1px,transparent_1px),linear-gradient(to_bottom,color-mix(in_oklab,var(--color-border)_55%,transparent)_1px,transparent_1px)] [background-size:32px_32px]" />
            <div className="relative h-36 md:h-44 bg-gradient-to-r from-primary/15 via-transparent to-blue-500/10" />

            <div className="relative px-5 pb-6 md:px-8 md:pb-8">
              <div className="-mt-16 flex flex-col gap-6 md:-mt-18 lg:flex-row lg:items-end lg:justify-between">
                <div className="flex flex-col gap-5 md:flex-row md:items-end">
                  <div className="size-28 shrink-0 rounded-full border-4 border-background shadow-lg md:size-32">
                    <Avatar
                      src={displayAvatar}
                      alt={displayName}
                      className="size-full rounded-full bg-primary text-3xl font-semibold text-primary-foreground"
                    />
                    {!displayAvatar && (
                      <div className="-mt-full flex size-full items-center justify-center rounded-full bg-primary text-3xl font-semibold text-primary-foreground">
                        {displayInitials}
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        {profile?.verified !== false && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 ring-1 ring-blue-200">
                            <CheckCircle2 className="size-3.5" />
                            {t("hero.verified")}
                          </span>
                        )}
                        {profile?.leaderboard && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700 ring-1 ring-amber-200">
                            <Trophy className="size-3.5" />
                            {t("hero.topRevenueBadge", {
                              rank: profile.leaderboard.rank,
                            })}
                          </span>
                        )}
                        {profile?.isPro && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground shadow-sm">
                            <ShieldCheck className="size-3.5" />
                            {t("hero.pro")}
                          </span>
                        )}
                      </div>
                      <div>
                        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
                          {displayName}
                        </h1>
                        <p className="text-sm font-medium text-muted-foreground md:text-base">
                          {displayRole}
                        </p>
                      </div>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                      <div className="rounded-2xl border border-amber-200 bg-amber-50/70 px-4 py-3 backdrop-blur-sm">
                        <div className="flex items-center gap-2 text-sm font-semibold text-amber-800">
                          <Trophy className="size-4" />
                          {profile?.leaderboard
                            ? t("stats.topThisMonth", {
                                rank: profile.leaderboard.rank,
                              })
                            : t("stats.notRanked")}
                        </div>
                        <p className="mt-1 text-xs text-amber-700/80">
                          {profile?.leaderboard
                            ? t("stats.topRevenueDescription", {
                                revenue: formatPropertyPrice(
                                  profile.leaderboard.revenue,
                                  "VND",
                                  profile.leaderboard.currency,
                                  locale,
                                ),
                                deals: profile.leaderboard.deals,
                              })
                            : t("stats.notRankedDescription")}
                        </p>
                      </div>

                      <div className="rounded-2xl border border-border/70 bg-background/80 px-4 py-3 backdrop-blur-sm">
                        <div className="flex items-center gap-2 text-sm font-semibold">
                          <span className="text-lg">{displayRating}/5</span>
                          <div className="flex items-center gap-1 text-amber-400">
                            <ReviewStars
                              rating={Math.round(displayRating)}
                              size={16}
                            />
                          </div>
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {t("stats.reviews", {
                            count: totalPublishedReviews,
                          })}
                        </p>
                      </div>

                      <div className="rounded-2xl border border-border/70 bg-background/80 px-4 py-3 backdrop-blur-sm">
                        <p className="text-lg font-semibold">
                          {activeListingsCount}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {t("stats.activeListings")}
                        </p>
                      </div>

                      <div className="rounded-2xl border border-border/70 bg-background/80 px-4 py-3 backdrop-blur-sm">
                        <div className="flex items-center gap-2 text-sm font-semibold">
                          <MapPin className="size-4 text-primary" />
                          {displayLocation}
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {t("stats.primaryMarket")}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                  <CsButton
                    className="border-border bg-background text-foreground hover:bg-accent"
                    variant="outline"
                    icon={<Phone className="mr-2 size-4" />}
                    onClick={handleRevealPhone}
                  >
                    {isPhoneVisible ? displayPhone : t("actions.showPhone")}
                  </CsButton>
                  <CsButton
                    className="bg-primary text-primary-foreground hover:bg-primary/90"
                    icon={<MessageSquare className="mr-2 size-4" />}
                    onClick={handleOpenConversation}
                    loading={isCreatingConversation}
                  >
                    {t("actions.chat")}
                  </CsButton>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-10 md:px-20 md:py-12">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,7fr)_minmax(320px,3fr)]">
          <div className="space-y-8">
            <section className="rounded-[28px] border border-border bg-card p-6 shadow-sm md:p-8">
              <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-primary">
                <BadgeCheck className="size-4" />
                {t("about.title")}
              </div>
              <div
                className="mt-4 w-full overflow-hidden wrap-break-word leading-7 [&_a]:text-primary [&_a]:underline [&_ol]:my-3 [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:mb-3 [&_pre]:overflow-x-auto [&_ul]:my-3 [&_ul]:list-disc [&_ul]:pl-5"
                dangerouslySetInnerHTML={{ __html: sanitizedAboutHtml }}
              />
            </section>

            <section className="relative overflow-hidden rounded-[28px] border border-border bg-card shadow-sm">
              <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-r from-primary/8 via-transparent to-primary/4" />

              <div className="relative p-6 md:p-8">
                <div className="flex flex-col gap-5 border-b border-border/80 pb-6">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                    <div className="max-w-2xl">
                      <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-primary/8 px-3 py-1 text-xs font-semibold text-primary ring-1 ring-primary/10">
                        <Building2 className="size-3.5" />
                        {t("listings.badge")}
                      </div>
                      <h2 className="text-2xl font-semibold tracking-tight md:text-[30px]">
                        {t("listings.title", { name: displayName })}
                      </h2>
                      <p className="mt-3 text-sm leading-6 text-muted-foreground md:text-base">
                        {t("listings.description")}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-3">
                      <div className="min-w-[140px] rounded-2xl border border-border/70 bg-background px-4 py-3">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                          {t("listings.liveInventory")}
                        </p>
                        <p className="mt-2 text-2xl font-semibold tracking-tight">
                          {activeListingsCount}
                        </p>
                      </div>
                      <div className="min-w-[180px] rounded-2xl border border-border/70 bg-background px-4 py-3">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                          {t("listings.focusMarket")}
                        </p>
                        <div className="mt-2 flex items-center gap-2 text-sm font-medium text-foreground">
                          <MapPin className="size-4 text-primary" />
                          <span>{displayLocation}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {displaySpecialties.slice(0, 3).map((specialty) => (
                      <span
                        key={specialty}
                        className="rounded-full border border-border bg-muted/50 px-3 py-1.5 text-xs font-medium text-foreground"
                      >
                        {specialty}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-6 rounded-[24px] bg-muted/20 p-3 md:p-4">
                  <div className="grid gap-5 md:grid-cols-2">
                    {isLoadingActiveListings &&
                      Array.from({ length: 4 }).map((_, index) => (
                        <PropertyCardSkeleton
                          key={`agent-listing-skeleton-${index}`}
                        />
                      ))}

                    {!isLoadingActiveListings &&
                      activeListings.map((listing) => (
                        <PropertyCard
                          key={listing._id}
                          id={listing._id}
                          image={
                            listing.media?.thumbnail ||
                            listing.media?.images?.[0] ||
                            bgImage.src
                          }
                          title={listing.title}
                          price={`$${listing.features?.price?.toLocaleString() || 0}`}
                          address={`${listing.location?.address}, ${listing.location?.ward}, ${listing.location?.province}`}
                          specs={{
                            beds: listing.features?.bedrooms || 0,
                            baths: listing.features?.bathrooms || 0,
                            area: listing.features?.area || 0,
                          }}
                          badges={{
                            aiRecommended: false,
                            tour3D: !!listing.media?.virtualTourUrls?.length,
                          }}
                          agent={{
                            name: listing.userId?.fullName || displayName,
                            avatar: listing.userId?.avatarUrl,
                          }}
                          postedAt={new Date(
                            listing.createdAt,
                          ).toLocaleDateString(localeTag, {
                            month: "short",
                            day: "2-digit",
                            year: "numeric",
                          })}
                          type="sale"
                          isFavorite={listing.isFavorite}
                        />
                      ))}
                  </div>

                  {!isLoadingActiveListings && activeListings.length === 0 && (
                    <div className="rounded-[22px] border border-dashed border-border bg-background px-6 py-12 text-center">
                      <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-primary/8 text-primary">
                        <Building2 className="size-5" />
                      </div>
                      <p className="mt-4 text-base font-semibold text-foreground">
                        {t("listings.emptyTitle")}
                      </p>
                      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
                        {t("listings.emptyDescription")}
                      </p>
                    </div>
                  )}
                </div>

                <div className="mt-6 flex flex-col gap-3 border-t border-border/80 pt-6 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm text-muted-foreground">
                    {t("listings.footerDescription")}
                  </p>
                  <CsButton
                    className="bg-background text-foreground hover:bg-accent"
                    variant="outline"
                    disabled={activeListings.length === 0}
                    icon={<ArrowUpRight className="ml-1 size-4" />}
                  >
                    {t("listings.viewAll")}
                  </CsButton>
                </div>
              </div>
            </section>

            <section className="rounded-[28px] border border-border bg-card p-6 shadow-sm md:p-8">
              <div className="mb-6">
                <p className="text-sm font-semibold text-primary">
                  {t("reviews.title")}
                </p>
                <h2 className="text-2xl font-semibold tracking-tight">
                  {t("reviews.subtitle", { name: displayName })}
                </h2>
              </div>

              {isLoadingPublicReviews ? (
                <div className="flex min-h-52 items-center justify-center">
                  <LoaderCircle className="size-6 animate-spin text-primary" />
                </div>
              ) : publicReviews.length === 0 ? (
                <div className="flex flex-col items-center gap-3 rounded-[24px] border border-dashed border-border bg-muted/20 px-6 py-14 text-center">
                  <div className="flex size-12 items-center justify-center rounded-full bg-primary/8 text-primary">
                    <Star className="size-5" />
                  </div>
                  <p className="font-semibold text-foreground">
                    {t("reviews.emptyTitle")}
                  </p>
                  <p className="max-w-xs text-sm leading-6 text-muted-foreground">
                    {t("reviews.emptyDescription")}
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="grid gap-4 lg:grid-cols-[220px_minmax(0,1fr)]">
                    <div className="rounded-[24px] border border-border bg-muted/20 p-5">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                        Điểm đánh giá
                      </p>
                      <p className="mt-3 text-5xl font-semibold tracking-tight text-foreground">
                        {reviewsSummary?.averageRating?.toFixed(1) || "0.0"}
                      </p>
                      <div className="mt-3">
                        <ReviewStars
                          rating={Math.round(
                            reviewsSummary?.averageRating || 0,
                          )}
                          size={18}
                        />
                      </div>
                      <p className="mt-3 text-sm text-muted-foreground">
                        {reviewsSummary?.totalReviews || 0} review đã xuất bản
                      </p>
                    </div>

                    <div className="rounded-[24px] border border-border bg-background p-5">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                        Phân bổ điểm số
                      </p>
                      <div className="mt-4 space-y-3">
                        {reviewsSummary?.breakdown.map((item) => {
                          const width =
                            reviewsSummary.totalReviews > 0
                              ? (item.count / reviewsSummary.totalReviews) * 100
                              : 0;

                          return (
                            <div
                              key={`public-breakdown-${item.star}`}
                              className="flex items-center gap-3"
                            >
                              <span className="w-10 text-xs font-semibold text-muted-foreground">
                                {item.star} sao
                              </span>
                              <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-muted">
                                <div
                                  className="h-full rounded-full bg-[color:var(--color-rating-star)]"
                                  style={{ width: `${width}%` }}
                                />
                              </div>
                              <span className="w-6 text-right text-xs text-muted-foreground">
                                {item.count}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {publicReviews.map((review) => (
                      <article
                        key={review.id}
                        className="rounded-[24px] border border-border bg-background p-5"
                      >
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                          <div className="flex items-start gap-3">
                            <div className="flex size-11 items-center justify-center rounded-full border border-border bg-muted text-sm font-semibold text-foreground">
                              {review.customerInitial}
                            </div>
                            <div>
                              <div className="flex flex-wrap items-center gap-2">
                                <p className="font-semibold text-foreground">
                                  {review.customerName}
                                </p>
                                <span className="text-xs text-muted-foreground">
                                  •
                                </span>
                                <p className="text-xs text-muted-foreground">
                                  {formatReviewDate(review.createdAt)}
                                </p>
                              </div>
                              <div className="mt-2">
                                <ReviewStars rating={review.rating} size={15} />
                              </div>
                            </div>
                          </div>

                          <div className="rounded-full border border-border bg-muted/30 px-3 py-1 text-xs font-medium text-muted-foreground">
                            {review.propertyName}
                          </div>
                        </div>

                        {review.tags.length > 0 && (
                          <div className="mt-4 flex flex-wrap gap-2">
                            {review.tags.map((tag) => (
                              <span
                                key={`${review.id}-${tag}`}
                                className="rounded-full border border-[color:var(--color-border-primary)] bg-[color:var(--color-bg-primary)]/10 px-3 py-1 text-xs font-medium text-[color:var(--color-text-primary)]"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}

                        <p className="mt-4 text-sm leading-7 text-foreground/85">
                          {review.comment ||
                            "Khách hàng không để lại nhận xét chi tiết."}
                        </p>

                        {review.agentReply && (
                          <div className="mt-4 rounded-2xl border border-border bg-muted/20 px-4 py-4">
                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                              Phản hồi từ môi giới
                            </p>
                            <p className="mt-2 text-sm leading-7 text-foreground/85">
                              {review.agentReply.content}
                            </p>
                          </div>
                        )}
                      </article>
                    ))}
                  </div>
                </div>
              )}
            </section>
          </div>

          <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
            <section className="rounded-[28px] border border-border bg-card p-6 shadow-sm">
              <p className="text-sm font-semibold text-primary">
                {t("contact.title", { name: displayName })}
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight">
                {t("contact.heading")}
              </h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {t("contact.description")}
              </p>

              <form className="mt-6 space-y-4">
                <input
                  className="h-12 w-full rounded-2xl border border-border bg-background px-4 text-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
                  placeholder={t("contact.namePlaceholder")}
                />
                <input
                  className="h-12 w-full rounded-2xl border border-border bg-background px-4 text-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
                  placeholder={t("contact.phonePlaceholder")}
                />
                <textarea
                  className="min-h-32 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
                  placeholder={t("contact.messagePlaceholder")}
                />
                <CsButton className="h-12 w-full bg-primary text-primary-foreground hover:bg-primary/90">
                  {t("contact.send")}
                </CsButton>
              </form>
            </section>

            <section className="rounded-[28px] border border-border bg-card p-6 shadow-sm">
              <p className="text-sm font-semibold text-primary">
                {t("specialties.title")}
              </p>
              <h2 className="mt-2 text-xl font-semibold tracking-tight">
                {t("specialties.heading")}
              </h2>
              <div className="mt-5 flex flex-wrap gap-2">
                {displaySpecialties.map((specialty) => (
                  <span
                    key={specialty}
                    className="rounded-full border border-border bg-muted/60 px-3 py-2 text-sm font-medium text-foreground"
                  >
                    {specialty}
                  </span>
                ))}
              </div>
            </section>
          </aside>
        </div>
      </section>
    </main>
  );
};

export default AgentPublicProfile;
