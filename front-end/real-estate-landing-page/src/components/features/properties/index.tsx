"use client";

import { findOptionLabel, LIST_PROVINCE, LIST_WARD } from "gra-helper";
import {
  AlertCircle,
  BookmarkPlus,
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
import { Input } from "@/components/ui/input";
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
import RecentlyViewedSection from "./components/RecentlyViewedSection";
import SavedSearchesPanel from "./components/SavedSearchesPanel";
import { useRecentlyViewedProperties } from "./recently-viewed/useRecentlyViewedProperties";
import {
  PROPERTY_SAVED_SEARCHES_STORAGE_KEY,
  type PropertySavedSearch,
} from "./saved-search/saved-search.types";
import {
  normalizeSavedSearches,
  upsertSavedSearch,
} from "./saved-search/saved-search.utils";
import {
  buildParamsFromSearchParams,
  buildPropertyQueryString,
  DEFAULT_PROPERTY_PARAMS,
  extractSearchFiltersFromParams,
  extractSidebarFiltersFromParams,
  type PropertyTabType,
} from "./search-state";
import { useFavoriteProperties, useOnSale } from "./services/query";

type PropertyFilters = Partial<IParamsPagination>;

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
  const savedSearchesT = useTranslations("PropertiesPage.savedSearches");
  const locale = useLocale();
  const searchParams = useSearchParams();
  const router = useRouter();

  const activeTab: PropertyTabType =
    searchParams.get("tab") === "favorites" ? "favorites" : "all";

  const initialParams = useMemo(
    () => buildParamsFromSearchParams(searchParams),
    [searchParams],
  );
  const initialSearchFilters = useMemo(
    () => extractSearchFiltersFromParams(initialParams),
    [initialParams],
  );
  const initialSidebarFilters = useMemo(
    () => extractSidebarFiltersFromParams(initialParams),
    [initialParams],
  );

  const [params, setParams] = useState<IParamsPagination>(initialParams);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [savedSearches, setSavedSearches] = useState<PropertySavedSearch[]>([]);
  const [savedSearchesHydrated, setSavedSearchesHydrated] = useState(false);
  const [isSaveSearchDialogOpen, setIsSaveSearchDialogOpen] = useState(false);
  const [savedSearchName, setSavedSearchName] = useState("");
  const {
    items: recentlyViewedItems,
    clearAll: clearRecentlyViewed,
    hydrated: recentlyViewedHydrated,
  } = useRecentlyViewedProperties();

  const gridRef = useRef<HTMLDivElement>(null);
  const sidebarFiltersRef = useRef<PropertyFilters>({});
  const searchFiltersRef = useRef<PropertyFilters>({});

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

  useEffect(() => {
    setParams(initialParams);
    sidebarFiltersRef.current = initialSidebarFilters;
    searchFiltersRef.current = initialSearchFilters;
  }, [initialParams, initialSearchFilters, initialSidebarFilters]);

  useEffect(() => {
    setIsLoggedIn(localStorage.getItem("isLoggedIn") === "true");
  }, []);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(
        PROPERTY_SAVED_SEARCHES_STORAGE_KEY,
      );
      const parsed = raw ? JSON.parse(raw) : [];
      setSavedSearches(normalizeSavedSearches(parsed));
    } catch {
      setSavedSearches([]);
    } finally {
      setSavedSearchesHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!savedSearchesHydrated) {
      return;
    }

    window.localStorage.setItem(
      PROPERTY_SAVED_SEARCHES_STORAGE_KEY,
      JSON.stringify(savedSearches),
    );
  }, [savedSearches, savedSearchesHydrated]);

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
        query: initialSearchFilters.query || "",
        demandType: initialSearchFilters.demandType || "all",
        propertyType: initialSearchFilters.propertyType || "all",
        maxPrice: initialSearchFilters.maxPrice ?? 5,
      }),
    [initialSearchFilters],
  );
  const activeFilterCount = useMemo(
    () =>
      [
        params["features.bedrooms"],
        params["features.bathrooms"],
        params["features.direction"],
        params.minBedrooms,
        params.minBathrooms,
        params.query,
        params.demandType,
        params.propertyType,
        params.maxPrice,
      ].filter(Boolean).length,
    [params],
  );

  const savedSearchQueryString = useMemo(
    () =>
      buildPropertyQueryString({
        params,
        includePage: false,
        includeLimit: false,
      }),
    [params],
  );
  const canSaveCurrentSearch = savedSearchQueryString.length > 0;

  const replacePropertiesRoute = (
    nextParams: IParamsPagination,
    nextTab: PropertyTabType = activeTab,
  ) => {
    const nextQuery = buildPropertyQueryString({
      params: nextParams,
      tab: nextTab,
    });

    router.replace(`/properties${nextQuery ? `?${nextQuery}` : ""}`, {
      scroll: false,
    });
  };

  const buildSavedSearchName = () => {
    const parts: string[] = [];

    if (typeof params.query === "string" && params.query.trim()) {
      parts.push(params.query.trim());
    }

    if (params.demandType === "SALE") {
      parts.push(t("search.demandSale"));
    } else if (params.demandType === "RENT") {
      parts.push(t("search.demandRent"));
    }

    const propertyTypeLabels: Record<string, string> = {
      APARTMENT: t("search.typeApartment"),
      HOUSE: t("search.typeHouse"),
      STREET_HOUSE: t("search.typeStreetHouse"),
      VILLA: t("search.typeVilla"),
      LAND: t("search.typeLand"),
      OTHER: t("search.typeOther"),
    };

    if (
      typeof params.propertyType === "string" &&
      propertyTypeLabels[params.propertyType]
    ) {
      parts.push(propertyTypeLabels[params.propertyType]);
    }

    if (typeof params.maxPrice === "number") {
      parts.push(
        savedSearchesT("priceCap", {
          price: params.maxPrice,
        }),
      );
    }

    if (parts.length === 0) {
      parts.push(savedSearchesT("fallbackName"));
    }

    return parts.slice(0, 3).join(" | ");
  };

  const handlePageChange = (page: number) => {
    setParams((prev) => {
      const nextParams = { ...prev, page };
      replacePropertiesRoute(nextParams);
      return nextParams;
    });
    gridRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleTabChange = (tab: PropertyTabType) => {
    const nextParams = { ...params, page: 1 };
    setParams(nextParams);
    replacePropertiesRoute(nextParams, tab);
  };

  const handleResetFilters = () => {
    sidebarFiltersRef.current = {};
    searchFiltersRef.current = {};
    setParams((prev) => {
      const nextParams = {
        page: DEFAULT_PROPERTY_PARAMS.page,
        limit: prev.limit || DEFAULT_PROPERTY_PARAMS.limit,
      };
      replacePropertiesRoute(nextParams);
      return nextParams;
    });
  };

  const handleFilterChange = (filters: PropertyFilters) => {
    sidebarFiltersRef.current = filters;
    setParams((prev) => {
      const { limit } = prev;
      const nextParams = {
        page: 1,
        limit,
        ...searchFiltersRef.current,
        ...filters,
      };
      replacePropertiesRoute(nextParams);
      return nextParams;
    });
  };

  const handleSearchChange = (filters: SearchFilters) => {
    const nextSearchParams: PropertyFilters = {};

    if (filters.demandType) nextSearchParams.demandType = filters.demandType;
    if (filters.propertyType)
      nextSearchParams.propertyType = filters.propertyType;
    if (typeof filters.maxPrice === "number") {
      nextSearchParams.maxPrice = filters.maxPrice;
    }
    if (filters.query) nextSearchParams.query = filters.query;

    searchFiltersRef.current = nextSearchParams;
    setParams((prev) => {
      const { limit } = prev;
      const nextParams = {
        page: 1,
        limit,
        ...sidebarFiltersRef.current,
        ...nextSearchParams,
      };
      replacePropertiesRoute(nextParams);
      return nextParams;
    });
  };

  const handleSortChange = (val: string) => {
    switch (val) {
      case "price_asc":
        setParams((prev) => {
          const nextParams: IParamsPagination = {
            ...prev,
            page: 1,
            sortField: "features.price",
            sortOrder: "asc",
          };
          replacePropertiesRoute(nextParams);
          return nextParams;
        });
        break;
      case "price_desc":
        setParams((prev) => {
          const nextParams: IParamsPagination = {
            ...prev,
            page: 1,
            sortField: "features.price",
            sortOrder: "desc",
          };
          replacePropertiesRoute(nextParams);
          return nextParams;
        });
        break;
      default:
        setParams((prev) => {
          const nextParams: IParamsPagination = { ...prev, page: 1 };
          delete nextParams.sortField;
          delete nextParams.sortOrder;
          replacePropertiesRoute(nextParams);
          return nextParams;
        });
        break;
    }
  };

  const handleOpenSaveSearchDialog = () => {
    const existingSearch = savedSearches.find(
      (item) => item.queryString === savedSearchQueryString,
    );
    setSavedSearchName(existingSearch?.name || buildSavedSearchName());
    setIsSaveSearchDialogOpen(true);
  };

  const handleSaveCurrentSearch = () => {
    const trimmedName = savedSearchName.trim();

    if (!trimmedName || !canSaveCurrentSearch) {
      return;
    }

    const existingSearch = savedSearches.find(
      (item) => item.queryString === savedSearchQueryString,
    );

    setSavedSearches((prev) =>
      upsertSavedSearch({
        items: prev,
        name: trimmedName,
        queryString: savedSearchQueryString,
        existingId: existingSearch?.id,
      }),
    );
    setIsSaveSearchDialogOpen(false);
  };

  const handleApplySavedSearch = (queryString: string) => {
    const nextSearchParams = new URLSearchParams(queryString);
    const nextParams = buildParamsFromSearchParams(nextSearchParams);

    sidebarFiltersRef.current = extractSidebarFiltersFromParams(nextParams);
    searchFiltersRef.current = extractSearchFiltersFromParams(nextParams);
    setParams(nextParams);

    router.replace(`/properties${queryString ? `?${queryString}` : ""}`, {
      scroll: false,
    });
  };

  const handleDeleteSavedSearch = (id: string) => {
    setSavedSearches((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <AdvancedSearch
        onSearchChange={handleSearchChange}
        initialFilters={{
          query: initialSearchFilters.query || "",
          demandType: initialSearchFilters.demandType || "all",
          propertyType: initialSearchFilters.propertyType || "all",
          maxPrice: initialSearchFilters.maxPrice,
        }}
        syncKey={searchSyncKey}
      />

      <main className="container mx-auto px-4 py-8 md:px-20">
        <div className="flex flex-col gap-8 lg:flex-row">
          <FilterSidebar
            className="hidden lg:block lg:w-1/4"
            onReset={handleResetFilters}
            onFilterChange={handleFilterChange}
            initialFilters={initialSidebarFilters}
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

            <div className="mb-6 overflow-x-auto">
              <div className="inline-flex min-w-max items-center gap-1 rounded-xl bg-gray-100 p-1">
                <button
                  type="button"
                  onClick={() => handleTabChange("all")}
                  className={`flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold transition-all duration-200 ${
                    isAllTab
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <Search className="h-4 w-4" />
                  {t("tabs.allProperties")}
                </button>
                {isLoggedIn ? (
                  <button
                    type="button"
                    onClick={() => handleTabChange("favorites")}
                    className={`flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold transition-all duration-200 ${
                      !isAllTab
                        ? "bg-white text-red-600 shadow-sm"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    <Heart
                      className={`h-4 w-4 ${!isAllTab ? "fill-current" : ""}`}
                    />
                    {t("tabs.myFavorites")}
                    {favorites?.data?.totalResults !== undefined &&
                    favorites.data.totalResults > 0 ? (
                      <span className="min-w-[20px] rounded-full bg-red-100 px-1.5 py-0.5 text-center text-xs font-bold text-red-600">
                        {favorites.data.totalResults}
                      </span>
                    ) : null}
                  </button>
                ) : null}
              </div>
            </div>

            {isAllTab ? (
              <>
                {recentlyViewedHydrated ? (
                  <div className="mb-6">
                    <RecentlyViewedSection
                      items={recentlyViewedItems}
                      maxItems={3}
                      onClear={clearRecentlyViewed}
                    />
                  </div>
                ) : null}

                <SavedSearchesPanel
                  items={savedSearches}
                  activeQueryString={savedSearchQueryString}
                  canSaveCurrentSearch={canSaveCurrentSearch}
                  onOpenSaveDialog={handleOpenSaveSearchDialog}
                  onApply={handleApplySavedSearch}
                  onDelete={handleDeleteSavedSearch}
                />
              </>
            ) : null}

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

            <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {isAllTab ? t("heading.allTitle") : t("heading.favTitle")}
                </h1>
                <p className="mt-1 text-sm text-gray-500">
                  {currentLoading ? (
                    <span className="inline-block h-4 w-40 animate-pulse rounded bg-gray-200" />
                  ) : (
                    t("heading.showing", {
                      count: currentResults.length,
                      total: currentData?.data?.totalResults || 0,
                    })
                  )}
                </p>
              </div>

              <div className="hidden items-center gap-3 lg:flex">
                <span className="text-sm font-medium text-gray-500">
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
                    className="h-10 border-gray-200 bg-white"
                  />
                </div>
              </div>
            </div>

            <div className="relative">
              {currentFetching && !currentLoading ? (
                <div className="pointer-events-none absolute inset-0 z-10 flex items-start justify-center pt-32">
                  <div className="rounded-full bg-white/80 p-3 shadow-lg backdrop-blur-sm">
                    <Loader2 className="h-6 w-6 animate-spin text-red-600" />
                  </div>
                </div>
              ) : null}

              <div
                className={`grid grid-cols-1 gap-6 transition-opacity duration-300 md:grid-cols-2 xl:grid-cols-3 ${
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
            (currentData?.data?.totalResults || 0) > 0 ? (
              <div className="mt-6 flex w-full justify-center">
                <CsPagination
                  total={currentData?.data?.totalResults || 0}
                  current={currentData?.data?.page || 1}
                  pageSize={currentData?.data?.limit || 6}
                  onChange={handlePageChange}
                  disabled={currentFetching}
                />
              </div>
            ) : null}
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
            initialFilters={initialSidebarFilters}
          />
        </div>
      </CsDialog>

      <CsDialog
        open={isSaveSearchDialogOpen}
        onOpenChange={setIsSaveSearchDialogOpen}
        title={savedSearchesT("dialogTitle")}
        okText={savedSearchesT("saveAction")}
        cancelText={savedSearchesT("cancelAction")}
        onOk={handleSaveCurrentSearch}
        onCancel={() => setIsSaveSearchDialogOpen(false)}
      >
        <div className="space-y-4">
          <p className="text-sm leading-6 text-stone-600">
            {savedSearchesT("dialogDescription")}
          </p>
          <Input
            value={savedSearchName}
            onChange={(event) => setSavedSearchName(event.target.value)}
            placeholder={savedSearchesT("namePlaceholder")}
            maxLength={80}
            preIcon={<BookmarkPlus className="h-4 w-4" />}
          />
        </div>
      </CsDialog>
    </div>
  );
};

export default Properties;
