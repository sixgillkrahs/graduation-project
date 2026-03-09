"use client";

import { CsButton } from "@/components/custom";
import { useAgentPublicProfile } from "@/components/features/agent-public-profile/services/query";
import { useCreateConversation } from "@/components/features/message/services/mutate";
import PropertyCard from "@/components/features/properties/components/PropertyCard";
import PropertyCardSkeleton from "@/components/features/properties/components/PropertyCardSkeleton";
import { useAgentOnSaleProperties } from "@/components/features/properties/services/query";
import { Avatar } from "@/components/ui/avatar";
import bgImage from "@/assets/images/bg.jpg";
import { ROUTES } from "@/const/routes";
import { useAppDispatch } from "@/lib/hooks";
import { openConversation } from "@/store/chat.store";
import { showAuthDialog } from "@/store/auth-dialog.store";
import DOMPurify from "dompurify";
import {
  ArrowUpRight,
  BadgeCheck,
  Building2,
  CheckCircle2,
  MapPin,
  MessageSquare,
  Phone,
  ShieldCheck,
  Star,
} from "lucide-react";
import { useParams } from "next/navigation";
import { useState } from "react";
import { useGetMe } from "@/shared/auth/query";

const fallbackAgent = {
  name: "Verified Real Estate Agent",
  role: "Professional Real Estate Consultant",
  location: "Hanoi, Vietnam",
  phone: "Phone available on request",
  about:
    "This profile represents a verified real estate professional with active market coverage, client support, and property advisory services. Public details will appear here once the agent profile has been fully completed.",
  specialties: ["Residential Sales", "Property Advisory", "Market Guidance"],
  stats: {
    rating: 4.8,
    reviews: 0,
    listings: 0,
  },
};

const ratingBreakdown = [
  { label: "5 star", value: 90 },
  { label: "4 star", value: 5 },
  { label: "3 star", value: 3 },
  { label: "2 star", value: 1 },
  { label: "1 star", value: 1 },
];

const reviews = [
  {
    name: "Nguyen T***",
    date: "March 3, 2026",
    rating: 5,
    comment:
      "Very professional and helpful during the entire process. Communication was quick and the property shortlist was exactly what I needed.",
  },
  {
    name: "Le H***",
    date: "February 24, 2026",
    rating: 5,
    comment:
      "Clear advice, strong market knowledge, and no pressure selling. The viewing schedule was handled smoothly from start to finish.",
  },
  {
    name: "Pham A***",
    date: "February 17, 2026",
    rating: 4,
    comment:
      "A trustworthy agent with good local expertise. I would have liked more options initially, but the final recommendation was a strong fit.",
  },
];

const AgentPublicProfile = () => {
  const params = useParams();
  const agentId = params?.id as string;
  const dispatch = useAppDispatch();
  const [isPhoneVisible, setIsPhoneVisible] = useState(false);
  const { data: me } = useGetMe();
  const { data: profileData } = useAgentPublicProfile(agentId);
  const { data: activeListingsData, isLoading: isLoadingActiveListings } =
    useAgentOnSaleProperties(agentId, {
      page: 1,
      limit: 4,
    });
  const { mutateAsync: createConversation, isPending: isCreatingConversation } =
    useCreateConversation();

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
      ? `${displayName} is an approved real estate agent with ${profile.yearsOfExperience} years of experience, specializing in ${displaySpecialties.join(", ")}${profile.workingAreas.length ? ` across ${profile.workingAreas.join(", ")}` : ""}.`
      : fallbackAgent.about;
  const sanitizedAboutHtml = DOMPurify.sanitize(aboutText);

  const openLoginDialog = (mode: "phone" | "message") => {
    dispatch(
      showAuthDialog({
        title:
          mode === "phone"
            ? "Đăng nhập để xem số điện thoại"
            : "Đăng nhập để nhắn tin với môi giới",
        description:
          mode === "phone"
            ? "Vui lòng đăng nhập để xem thông tin liên hệ của môi giới này."
            : "Vui lòng đăng nhập để bắt đầu cuộc trò chuyện với môi giới này.",
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
                  <div className="size-28 rounded-full border-4 border-background shadow-lg md:size-32">
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
                            Verified Agent
                          </span>
                        )}
                        {profile?.isPro && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground shadow-sm">
                            <ShieldCheck className="size-3.5" />
                            PRO Member
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

                    <div className="grid gap-3 sm:grid-cols-3">
                      <div className="rounded-2xl border border-border/70 bg-background/80 px-4 py-3 backdrop-blur-sm">
                        <div className="flex items-center gap-2 text-sm font-semibold">
                          <span className="text-lg">{displayRating}/5</span>
                          <div className="flex items-center gap-1 text-amber-400">
                            {Array.from({ length: 5 }).map((_, index) => (
                              <Star
                                key={index}
                                className="size-4 fill-current"
                              />
                            ))}
                          </div>
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {fallbackAgent.stats.reviews} Reviews
                        </p>
                      </div>

                      <div className="rounded-2xl border border-border/70 bg-background/80 px-4 py-3 backdrop-blur-sm">
                        <p className="text-lg font-semibold">
                          {activeListingsCount}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          Active Listings
                        </p>
                      </div>

                      <div className="rounded-2xl border border-border/70 bg-background/80 px-4 py-3 backdrop-blur-sm">
                        <div className="flex items-center gap-2 text-sm font-semibold">
                          <MapPin className="size-4 text-primary" />
                          {displayLocation}
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">
                          Primary Market
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
                    {isPhoneVisible ? displayPhone : "Show Phone Number"}
                  </CsButton>
                  <CsButton
                    className="bg-primary text-primary-foreground hover:bg-primary/90"
                    icon={<MessageSquare className="mr-2 size-4" />}
                    onClick={handleOpenConversation}
                    loading={isCreatingConversation}
                  >
                    Chat / Message
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
                About Me
              </div>
              <div
                className="mt-4 max-w-3xl leading-7 [&_p]:mb-3 [&_ul]:my-3 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:my-3 [&_ol]:list-decimal [&_ol]:pl-5 [&_a]:text-primary [&_a]:underline"
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
                        Active Listings
                      </div>
                      <h2 className="text-2xl font-semibold tracking-tight md:text-[30px]">
                        Properties currently represented by {displayName}
                      </h2>
                      <p className="mt-3 text-sm leading-6 text-muted-foreground md:text-base">
                        A curated snapshot of this agent&apos;s live sale
                        listings, presented for active buyers and investors.
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-3">
                      <div className="min-w-[140px] rounded-2xl border border-border/70 bg-background px-4 py-3">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                          Live inventory
                        </p>
                        <p className="mt-2 text-2xl font-semibold tracking-tight">
                          {activeListingsCount}
                        </p>
                      </div>
                      <div className="min-w-[180px] rounded-2xl border border-border/70 bg-background px-4 py-3">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                          Focus market
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
                          ).toLocaleDateString("en-US", {
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
                        No active properties for sale
                      </p>
                      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
                        This agent does not have any published sale listings at
                        the moment.
                      </p>
                    </div>
                  )}
                </div>

                <div className="mt-6 flex flex-col gap-3 border-t border-border/80 pt-6 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm text-muted-foreground">
                    Showing the latest portfolio highlights currently available
                    under this agent.
                  </p>
                  <CsButton
                    className="bg-background text-foreground hover:bg-accent"
                    variant="outline"
                    disabled={activeListings.length === 0}
                    icon={<ArrowUpRight className="ml-1 size-4" />}
                  >
                    View all properties by this agent
                  </CsButton>
                </div>
              </div>
            </section>

            <section className="rounded-[28px] border border-border bg-card p-6 shadow-sm md:p-8">
              <div className="mb-6">
                <p className="text-sm font-semibold text-primary">
                  Ratings & Reviews
                </p>
                <h2 className="text-2xl font-semibold tracking-tight">
                  What clients say about working with {displayName}
                </h2>
              </div>

              <div className="grid gap-8 border-b border-border pb-8 lg:grid-cols-[220px_minmax(0,1fr)]">
                <div className="rounded-[24px] bg-muted/50 p-5">
                  <p className="text-5xl font-bold tracking-tight">
                    {displayRating}
                  </p>
                  <div className="mt-3 flex items-center gap-1 text-amber-400">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <Star key={index} className="size-5 fill-current" />
                    ))}
                  </div>
                  <p className="mt-3 text-sm text-muted-foreground">
                    Based on {fallbackAgent.stats.reviews} verified reviews
                  </p>
                </div>

                <div className="space-y-3">
                  {ratingBreakdown.map((item) => (
                    <div
                      key={item.label}
                      className="grid grid-cols-[56px_minmax(0,1fr)_48px] items-center gap-3 text-sm"
                    >
                      <span className="font-medium text-foreground">
                        {item.label}
                      </span>
                      <div className="h-2 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-primary"
                          style={{ width: `${item.value}%` }}
                        />
                      </div>
                      <span className="text-right text-muted-foreground">
                        {item.value}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-8 space-y-4">
                {reviews.map((review) => (
                  <article
                    key={`${review.name}-${review.date}`}
                    className="rounded-[24px] border border-border bg-background p-5"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                        {review.name[0]}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <h3 className="font-semibold">{review.name}</h3>
                            <p className="text-sm text-muted-foreground">
                              {review.date}
                            </p>
                          </div>
                          <div className="flex items-center gap-1 text-amber-400">
                            {Array.from({ length: review.rating }).map(
                              (_, index) => (
                                <Star
                                  key={index}
                                  className="size-4 fill-current"
                                />
                              ),
                            )}
                          </div>
                        </div>
                        <p className="mt-3 leading-7 text-muted-foreground">
                          {review.comment}
                        </p>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          </div>

          <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
            <section className="rounded-[28px] border border-border bg-card p-6 shadow-sm">
              <p className="text-sm font-semibold text-primary">
                Contact {displayName}
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight">
                Start a conversation
              </h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Leave your details and a short message. Expect a quick callback
                about matching listings, pricing, or viewing arrangements.
              </p>

              <form className="mt-6 space-y-4">
                <input
                  className="h-12 w-full rounded-2xl border border-border bg-background px-4 text-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
                  placeholder="Your name"
                />
                <input
                  className="h-12 w-full rounded-2xl border border-border bg-background px-4 text-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
                  placeholder="Phone number"
                />
                <textarea
                  className="min-h-32 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
                  placeholder="Tell the agent what kind of property you are looking for..."
                />
                <CsButton className="h-12 w-full bg-primary text-primary-foreground hover:bg-primary/90">
                  Send Message
                </CsButton>
              </form>
            </section>

            <section className="rounded-[28px] border border-border bg-card p-6 shadow-sm">
              <p className="text-sm font-semibold text-primary">Specialties</p>
              <h2 className="mt-2 text-xl font-semibold tracking-tight">
                Core service areas
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
