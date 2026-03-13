"use client";

import { findOptionLabel, LIST_PROVINCE, LIST_WARD } from "gra-helper";
import {
  AlertCircle,
  Heart,
  House,
  Loader2,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useMemo, useRef, useState } from "react";
import type { IParamsPagination } from "@/@types/service";
import { CsPagination } from "@/components/custom";
import { CsDialog } from "@/components/custom/dialog";
import { CsSelect } from "@/components/ui/select";
import StateSurface from "@/components/ui/state-surface";
import { formatPropertyPostedDate } from "@/lib/property-date";
import { mapPropertyToCompareItem } from "./compare/compare.utils";
import AdvancedSearch, {
  type SearchFilters,
} from "./components/AdvancedSearch";
import FilterSidebar from "./components/FilterSidebar";
import PropertyCard from "./components/PropertyCard";
import PropertyCardSkeleton from "./components/PropertyCardSkeleton";
import { useFavoriteProperties, useOnSale } from "./services/query";

type TabType = "all" | "favorites";
type PropertyFilters = Partial<IParamsPagination>;

const DEFAULT_PARAMS: IParamsPagination = {
  page: 1,
  limit: 6,
};
const PROPERTY_SKELETON_KEYS = [
  "property-skeleton-1",
  "property-skeleton-2",
  "property-skeleton-3",
  "property-skeleton-4",
  "property-skeleton-5",
  "property-skeleton-6",
] as const;

const getSortValue = (params: IParamsPagination) =>
  params.sortField === "features.price"
    ? params.sortOrder === "asc"
      ? "price_asc"
      : "price_desc"
    : "newest";

const buildParamsFromSearchParams = (
  searchParams: URLSearchParams,
): IParamsPagination => {
  const params: IParamsPagination = {
    page: Number(searchParams.get("page") || DEFAULT_PARAMS.page),
    limit: Number(searchParams.get("limit") || DEFAULT_PARAMS.limit),
  };

  const knownKeys = [
    "query",
    "demandType",
    "propertyType",
    "maxPrice",
    "hasVirtualTour",
    "features.bedrooms",
    "features.bathrooms",
    "features.direction",
    "minBedrooms",
    "minBathrooms",
    "sortField",
    "sortOrder",
  ] as const;

  knownKeys.forEach((key) => {
    const value = searchParams.get(key);
    if (!value) {
      return;
    }

    if (
      key === "maxPrice" ||
      key === "features.bedrooms" ||
      key === "features.bathrooms" ||
      key === "minBedrooms" ||
      key === "minBathrooms"
    ) {
      params[key] = Number(value);
      return;
    }

    params[key] = value;
  });

  return params;
};

const getContextContent = (params: IParamsPagination) => {
  if (params.hasVirtualTour === "true" || params.hasVirtualTour === true) {
    return {
      eyebrow: "Immersive Search",
      title: "Homes with 3D virtual tours",
      description:
        "Browse listings you can inspect remotely before booking an in-person visit.",
      badge: "3D tours only",
    };
  }

  if (params.demandType === "SALE") {
    return {
      eyebrow: "Buy With Clarity",
      title: "Homes for sale",
      description:
        "Focus on ownership-ready listings, compare pricing, and shortlist the right neighborhoods faster.",
      badge: "For sale",
    };
  }

  if (params.demandType === "RENT") {
    return {
      eyebrow: "Rent Smarter",
      title: "Rental properties",
      description:
        "Explore move-in-ready listings with filters tuned for budget, location and convenience.",
      badge: "For rent",
    };
  }

  return {
    eyebrow: "Explore Market",
    title: "All available properties",
    description:
      "Search across sale and rental listings, then narrow the shortlist with practical filters.",
    badge: "All listings",
  };
};

const Properties = () => {
  const t = useTranslations("PropertiesPage");
  const locale = useLocale();
  const searchParams = useSearchParams();
  const router = useRouter();

  // URL is the single source of truth for the active tab
  const activeTab: TabType =
    searchParams.get("tab") === "favorites" ? "favorites" : "all";

  const initialParams = useMemo(
    () => buildParamsFromSearchParams(searchParams),
    [searchParams],
  );
  const [params, setParams] = useState<IParamsPagination>(initialParams);

  const {
    data: onSale,
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useOnSale(params);
  const {
    data: favorites,
    isLoading: isFavLoading,
    isFetching: isFavFetching,
    isError: isFavError,
    refetch: refetchFavorites,
  } = useFavoriteProperties(params);

  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setParams(initialParams);
  }, [initialParams]);

  const isAllTab = activeTab === "all";
  const currentData = isAllTab ? onSale : favorites;
  const currentLoading = isAllTab ? isLoading : isFavLoading;
  const currentFetching = isAllTab ? isFetching : isFavFetching;
  const currentError = isAllTab ? isError : isFavError;
  const currentRefetch = isAllTab ? refetch : refetchFavorites;
  const currentResults = currentData?.data?.results || [];
  const hasCurrentResults = currentResults.length > 0;
  const contextContent = useMemo(() => getContextContent(params), [params]);
  const searchSyncKey = useMemo(
    () =>
      JSON.stringify({
        query: initialParams.query || "",
        demandType: initialParams.demandType || "all",
        propertyType: initialParams.propertyType || "all",
        maxPrice: initialParams.maxPrice || 5,
      }),
    [initialParams],
  );
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const activeFilterCount = useMemo(
    () =>
      [
        params["features.bedrooms"],
        params["features.bathrooms"],
        params["features.direction"],
        params.minBedrooms,
        params.minBathrooms,
      ].filter(Boolean).length,
    [params],
  );

  const handlePageChange = (page: number) => {
    setParams((prev) => ({ ...prev, page }));
    gridRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleTabChange = (tab: TabType) => {
    // Reset to page 1 when switching tabs, keep filters
    setParams((prev) => ({ ...prev, page: 1 }));
    const nextUrlParams = new URLSearchParams(searchParams.toString());

    if (tab === "favorites") {
      nextUrlParams.set("tab", "favorites");
    } else {
      nextUrlParams.delete("tab");
    }

    const nextQuery = nextUrlParams.toString();
    router.replace(`/properties${nextQuery ? `?${nextQuery}` : ""}`, {
      scroll: false,
    });
  };

  const handleResetFilters = () => {
    sidebarFiltersRef.current = {};
    searchFiltersRef.current = {};
    setParams(initialParams);
  };

  // Refs to track current sidebar and search filters separately
  const sidebarFiltersRef = useRef<PropertyFilters>({});
  const searchFiltersRef = useRef<PropertyFilters>({});

  const handleFilterChange = (filters: PropertyFilters) => {
    sidebarFiltersRef.current = filters;
    setParams((prev) => {
      const { limit } = prev;
      return { page: 1, limit, ...searchFiltersRef.current, ...filters };
    });
  };

  const handleSearchChange = (filters: SearchFilters) => {
    const searchParams: PropertyFilters = {};
    if (filters.demandType) searchParams.demandType = filters.demandType;
    if (filters.propertyType) searchParams.propertyType = filters.propertyType;
    if (filters.maxPrice) searchParams.maxPrice = filters.maxPrice;
    if (filters.query) searchParams.query = filters.query;
    searchFiltersRef.current = searchParams;
    setParams((prev) => {
      const { limit } = prev;
      return { page: 1, limit, ...sidebarFiltersRef.current, ...searchParams };
    });
  };

  const handleSortChange = (val: string) => {
    switch (val) {
      case "price_asc":
        setParams((prev) => ({
          ...prev,
          page: 1,
          sortField: "features.price",
          sortOrder: "asc",
        }));
        break;
      case "price_desc":
        setParams((prev) => ({
          ...prev,
          page: 1,
          sortField: "features.price",
          sortOrder: "desc",
        }));
        break;
      default:
        setParams((prev) => {
          const nextParams = { ...prev, page: 1 };
          delete nextParams.sortField;
          delete nextParams.sortOrder;
          return nextParams;
        });
        break;
    }
  };

  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    setIsLoggedIn(localStorage.getItem("isLoggedIn") === "true");
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <AdvancedSearch
        onSearchChange={handleSearchChange}
        initialFilters={{
          query: String(initialParams.query || ""),
          demandType: String(initialParams.demandType || "all"),
          propertyType: String(initialParams.propertyType || "all"),
          maxPrice:
            typeof initialParams.maxPrice === "number"
              ? initialParams.maxPrice
              : undefined,
        }}
        syncKey={searchSyncKey}
      />

      <main className="container mx-auto px-4 md:px-20 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <FilterSidebar
            className="hidden lg:block lg:w-1/4"
            onReset={handleResetFilters}
            onFilterChange={handleFilterChange}
          />

          <div className="flex-1" ref={gridRef}>
            <section className="mb-6 overflow-hidden rounded-[28px] border border-stone-200 bg-[linear-gradient(135deg,#f8f5ef_0%,#ffffff_58%,#efe7dc_100%)] p-6 shadow-sm">
              <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                <div className="max-w-2xl">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">
                    {contextContent.eyebrow}
                  </p>
                  <h1 className="mt-2 text-3xl font-semibold tracking-tight text-stone-900">
                    {contextContent.title}
                  </h1>
                  <p className="mt-3 text-sm leading-6 text-stone-600">
                    {contextContent.description}
                  </p>
                </div>
                <span className="inline-flex w-fit rounded-full border border-stone-300 bg-white/80 px-4 py-2 text-sm font-medium text-stone-700">
                  {contextContent.badge}
                </span>
              </div>
            </section>

            {/* Tabs */}
            <div className="mb-6 overflow-x-auto">
              <div className="inline-flex min-w-max items-center gap-1 rounded-xl bg-gray-100 p-1">
                <button
                  type="button"
                  onClick={() => handleTabChange("all")}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                    isAllTab
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <Search className="w-4 h-4" />
                  {t("tabs.allProperties")}
                </button>
                {isLoggedIn && (
                  <button
                    type="button"
                    onClick={() => handleTabChange("favorites")}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                      !isAllTab
                        ? "bg-white text-red-600 shadow-sm"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    <Heart
                      className={`w-4 h-4 ${!isAllTab ? "fill-current" : ""}`}
                    />
                    {t("tabs.myFavorites")}
                    {favorites?.data?.totalResults !== undefined &&
                      favorites.data.totalResults > 0 && (
                        <span className="bg-red-100 text-red-600 text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
                          {favorites.data.totalResults}
                        </span>
                      )}
                  </button>
                )}
              </div>
            </div>

            <div className="mb-6 grid grid-cols-1 gap-3 lg:hidden">
              <button
                type="button"
                onClick={() => setIsMobileFiltersOpen(true)}
                className="flex h-11 items-center justify-between rounded-xl border border-gray-200 bg-white px-4 text-sm font-semibold text-gray-900 shadow-sm transition-colors hover:border-red-200 hover:bg-red-50/40"
              >
                <span className="flex items-center gap-2">
                  <SlidersHorizontal className="h-4 w-4 text-red-500" />
                  {t("filter.title")}
                </span>
                {activeFilterCount > 0 ? (
                  <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-bold text-red-600">
                    {activeFilterCount}
                  </span>
                ) : (
                  <span className="text-xs font-medium text-gray-500">
                    Open
                  </span>
                )}
              </button>

              <CsSelect
                placeholder={t("sort.placeholder")}
                value={getSortValue(params)}
                onChange={handleSortChange}
                options={[
                  { value: "newest", label: t("sort.newest") },
                  { value: "price_asc", label: t("sort.priceLowHigh") },
                  { value: "price_desc", label: t("sort.priceHighLow") },
                ]}
                className="h-11 border-gray-200 bg-white"
              />
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {isAllTab ? t("heading.allTitle") : t("heading.favTitle")}
                </h1>
                <p className="text-gray-500 text-sm mt-1">
                  {currentLoading ? (
                    <span className="inline-block h-4 w-40 bg-gray-200 rounded animate-pulse" />
                  ) : (
                    t("heading.showing", {
                      count: currentResults.length,
                      total: currentData?.data?.totalResults || 0,
                    })
                  )}
                </p>
              </div>

              <div className="hidden items-center gap-3 lg:flex">
                <span className="text-gray-500 text-sm font-medium">
                  {t("sort.label")}
                </span>
                <div className="w-48">
                  <CsSelect
                    placeholder={t("sort.placeholder")}
                    value={getSortValue(params)}
                    onChange={handleSortChange}
                    options={[
                      { value: "newest", label: t("sort.newest") },
                      { value: "price_asc", label: t("sort.priceLowHigh") },
                      { value: "price_desc", label: t("sort.priceHighLow") },
                    ]}
                    className="border-gray-200 h-10 bg-white"
                  />
                </div>
              </div>
            </div>

            {/* Grid with transition */}
            <div className="relative">
              {/* Fetching overlay — spinner on top of stale data */}
              {currentFetching && !currentLoading && (
                <div className="absolute inset-0 z-10 flex items-start justify-center pt-32 pointer-events-none">
                  <div className="bg-white/80 backdrop-blur-sm rounded-full p-3 shadow-lg">
                    <Loader2 className="w-6 h-6 text-red-600 animate-spin" />
                  </div>
                </div>
              )}

              <div
                className={`grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 transition-opacity duration-300 ${
                  currentFetching && !currentLoading
                    ? "opacity-50"
                    : "opacity-100"
                }`}
              >
                {currentLoading
                  ? PROPERTY_SKELETON_KEYS.map((key) => (
                      <PropertyCardSkeleton key={key} />
                    ))
                  : hasCurrentResults
                    ? currentResults.map((prop) => (
                        <PropertyCard
                          key={prop._id}
                          id={prop._id}
                          image={prop.media.thumbnail}
                          title={prop.title}
                          badges={{
                            aiRecommended: false,
                            tour3D: prop.media.virtualTourUrls.length > 0,
                          }}
                          address={`${prop.location.address}, ${findOptionLabel(prop.location.ward, LIST_WARD)}, ${findOptionLabel(prop.location.province, LIST_PROVINCE)}`}
                          price={prop.features.price.toString()}
                          currency={prop.features.currency}
                          specs={{
                            beds: prop.features.bedrooms,
                            baths: prop.features.bathrooms,
                            area: prop.features.area,
                          }}
                          unit={prop.features.priceUnit}
                          agent={{
                            name: prop.userId.fullName,
                            avatar: prop.userId.avatarUrl,
                          }}
                          postedAt={formatPropertyPostedDate(
                            prop.createdAt,
                            locale,
                          )}
                          type={prop.demandType === "sale" ? "sale" : "rent"}
                          isFavorite={prop.isFavorite}
                          compareItem={mapPropertyToCompareItem(prop)}
                        />
                      ))
                    : null}
              </div>

              {!currentLoading && currentError && !hasCurrentResults ? (
                <StateSurface
                  className="mt-2"
                  tone="danger"
                  eyebrow={isAllTab ? "Properties" : "Favorites"}
                  icon={<AlertCircle className="h-6 w-6" />}
                  title={
                    isAllTab
                      ? "Could not load properties"
                      : "Could not load your favorites"
                  }
                  description={
                    isAllTab
                      ? "The listing feed is temporarily unavailable. Try again or clear the current filters."
                      : "Your saved properties could not be loaded right now. Try again in a moment."
                  }
                  primaryAction={{
                    label: "Try again",
                    onClick: () => {
                      void currentRefetch();
                    },
                  }}
                  secondaryAction={{
                    label: isAllTab ? "Clear filters" : t("tabs.allProperties"),
                    onClick: () => {
                      if (isAllTab) {
                        handleResetFilters();
                        return;
                      }

                      handleTabChange("all");
                    },
                    variant: "outline",
                  }}
                />
              ) : null}

              {!currentLoading && !currentError && !hasCurrentResults ? (
                <StateSurface
                  className="mt-2"
                  tone="brand"
                  eyebrow={isAllTab ? "Properties" : "Favorites"}
                  icon={
                    isAllTab ? (
                      <House className="h-6 w-6" />
                    ) : (
                      <Heart className="h-6 w-6" />
                    )
                  }
                  title={
                    isAllTab
                      ? "No properties match these filters"
                      : t("empty.noFavorites")
                  }
                  description={
                    isAllTab
                      ? "Try widening your budget, changing the property type, or resetting the search to see more listings."
                      : t("empty.noFavoritesDesc")
                  }
                  primaryAction={{
                    label: isAllTab ? "Reset filters" : t("tabs.allProperties"),
                    onClick: () => {
                      if (isAllTab) {
                        handleResetFilters();
                        return;
                      }

                      handleTabChange("all");
                    },
                  }}
                  secondaryAction={
                    isAllTab
                      ? {
                          label: "Refresh results",
                          onClick: () => {
                            void currentRefetch();
                          },
                          variant: "outline" as const,
                        }
                      : undefined
                  }
                />
              ) : null}
            </div>

            {!currentLoading &&
              !currentError &&
              (currentData?.data?.totalResults || 0) > 0 && (
                <div className="mt-6 flex justify-center w-full">
                  <CsPagination
                    total={currentData?.data?.totalResults || 0}
                    current={currentData?.data?.page || 1}
                    pageSize={currentData?.data?.limit || 6}
                    onChange={handlePageChange}
                    disabled={currentFetching}
                  />
                </div>
              )}
          </div>
        </div>
      </main>

      <CsDialog
        open={isMobileFiltersOpen}
        onOpenChange={setIsMobileFiltersOpen}
        title={t("filter.title")}
        from="bottom"
        footer={null}
        className="w-full max-w-none rounded-t-[28px] sm:max-w-lg"
      >
        <div className="space-y-3">
          <p className="text-sm text-gray-500">
            Refine bedrooms, bathrooms, and orientation without losing your
            place in the results.
          </p>
          <FilterSidebar
            sticky={false}
            className="border-none p-0"
            onReset={handleResetFilters}
            onFilterChange={handleFilterChange}
          />
        </div>
      </CsDialog>
    </div>
  );
};

export default Properties;
