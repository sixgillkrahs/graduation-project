"use client";

import { findOptionLabel, LIST_PROVINCE, LIST_WARD } from "gra-helper";
import {
  AlertCircle,
  BookmarkPlus,
  ChevronDown,
  Heart,
  House,
  Loader2,
  MapPin,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useMemo, useRef, useState } from "react";
import type { IParamsPagination } from "@/@types/service";
import { CsButton, CsPagination } from "@/components/custom";
import { CsDialog } from "@/components/custom/dialog";
import { ROUTES } from "@/const/routes";
import { Input } from "@/components/ui/input";
import StateSurface from "@/components/ui/state-surface";
import { formatPropertyPostedDate } from "@/lib/property-date";
import { mapPropertyToCompareItem } from "./compare/compare.utils";
import AdvancedSearch, {
  type SearchFilters,
} from "./components/AdvancedSearch";
import FilterSidebar from "./components/FilterSidebar";
import PropertyCard from "./components/PropertyCard";
import PropertyCardSkeleton from "./components/PropertyCardSkeleton";
import PropertySearchModeSwitch from "./components/PropertySearchModeSwitch";
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
  SemanticSearchComposer,
  SemanticSearchFilters,
  SemanticSearchSummary,
} from "./semantic-search/components";
import type {
  PropertySearchMode,
  SemanticSearchUrlState,
} from "./semantic-search/types";
import {
  buildSemanticSearchQueryString,
  buildSemanticSearchRequest,
  buildSemanticStateFromStandardParams,
  hasSemanticQuery,
  normalizeSemanticFilters,
  parseSemanticSearchState,
  SEMANTIC_SEARCH_MODE,
} from "./semantic-search/url-state";
import {
  formatSemanticAddress,
  formatSemanticScoreLabel,
  normalizeSemanticProperty,
} from "./semantic-search/utils";
import {
  buildParamsFromSearchParams,
  buildPropertyQueryString,
  DEFAULT_PROPERTY_PARAMS,
  extractSearchFiltersFromParams,
  extractSidebarFiltersFromParams,
  type PropertyTabType,
} from "./search-state";
import {
  useFavoriteProperties,
  useOnSale,
  useSemanticPropertySearch,
} from "./services/query";

type PropertyFilters = Partial<IParamsPagination>;

const PROPERTY_SKELETON_KEYS = [
  "property-skeleton-1",
  "property-skeleton-2",
  "property-skeleton-3",
  "property-skeleton-4",
  "property-skeleton-5",
  "property-skeleton-6",
] as const;

const FEATURED_PROVINCE_QUERIES = [
  "ha noi",
  "ho chi minh",
  "da nang",
  "hai phong",
  "can tho",
  "khanh hoa",
  "lam dong",
  "quang ninh",
  "binh duong",
  "dong nai",
  "ba ria vung tau",
  "thua thien hue",
] as const;

const normalizeProvinceQuery = (value?: string) =>
  (value || "")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/đ/gu, "d")
    .toLowerCase()
    .trim();

const getSortValue = (params: IParamsPagination) =>
  params.sortField === "features.price"
    ? params.sortOrder === "asc"
      ? "price_asc"
      : "price_desc"
    : "newest";

const getContextContent = (
  params: IParamsPagination,
  t: ReturnType<typeof useTranslations<"PropertiesPage">>,
) => {
  if (params.hasVirtualTour === "true" || params.hasVirtualTour === true) {
    return {
      eyebrow: t("standardSearch.virtualTour.eyebrow"),
      title: t("standardSearch.virtualTour.title"),
      description: t("standardSearch.virtualTour.description"),
      badge: t("standardSearch.virtualTour.badge"),
    };
  }

  if (params.demandType === "SALE") {
    return {
      eyebrow: t("standardSearch.sale.eyebrow"),
      title: t("standardSearch.sale.title"),
      description: t("standardSearch.sale.description"),
      badge: t("standardSearch.sale.badge"),
    };
  }

  if (params.demandType === "RENT") {
    return {
      eyebrow: t("standardSearch.rent.eyebrow"),
      title: t("standardSearch.rent.title"),
      description: t("standardSearch.rent.description"),
      badge: t("standardSearch.rent.badge"),
    };
  }

  return {
    eyebrow: t("standardSearch.all.eyebrow"),
    title: t("standardSearch.all.title"),
    description: t("standardSearch.all.description"),
    badge: t("standardSearch.all.badge"),
  };
};

const getSemanticContextContent = (
  semanticState: SemanticSearchUrlState,
  t: ReturnType<typeof useTranslations<"PropertiesPage.semanticSearch">>,
) => {
  if (!semanticState.query.trim()) {
    return {
      eyebrow: t("heroEyebrow"),
      title: t("heroTitle"),
      description: t("heroDescription"),
      badge: t("heroBadge"),
    };
  }

  return {
    eyebrow: semanticState.explain
      ? t("heroExplainEyebrow")
      : t("heroResultsEyebrow"),
    title: t("heroResultsTitle", {
      query: semanticState.query,
    }),
    description: semanticState.explain
      ? t("heroExplainDescription")
      : t("heroResultsDescription"),
    badge: semanticState.explain
      ? t("heroExplainBadge")
      : t("heroResultsBadge"),
  };
};

const buildStandardPropertyAddress = (params: {
  address: string;
  ward: string;
  province: string;
}) =>
  [
    params.address,
    findOptionLabel(params.ward, LIST_WARD) || params.ward,
    findOptionLabel(params.province, LIST_PROVINCE) || params.province,
  ]
    .filter(Boolean)
    .join(", ");

const countSemanticFilters = (state: SemanticSearchUrlState) =>
  Object.values(state.filters).reduce((count, value) => {
    if (Array.isArray(value)) {
      return value.length > 0 ? count + 1 : count;
    }

    return value !== undefined && value !== null && value !== ""
      ? count + 1
      : count;
  }, 0);

const Properties = () => {
  const t = useTranslations("PropertiesPage");
  const savedSearchesT = useTranslations("PropertiesPage.savedSearches");
  const semanticT = useTranslations("PropertiesPage.semanticSearch");
  const locale = useLocale();
  const searchParams = useSearchParams();
  const router = useRouter();
  const searchMode: PropertySearchMode =
    searchParams.get("mode") === SEMANTIC_SEARCH_MODE ? "semantic" : "standard";
  const isSemanticMode = searchMode === "semantic";

  const activeTab: PropertyTabType =
    searchParams.get("tab") === "favorites" ? "favorites" : "all";

  const initialParams = useMemo(
    () => buildParamsFromSearchParams(searchParams),
    [searchParams],
  );
  const semanticState = useMemo(
    () => parseSemanticSearchState(searchParams),
    [searchParams],
  );
  const semanticRequest = useMemo(
    () => buildSemanticSearchRequest(semanticState),
    [semanticState],
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
  const [isFilterSidebarCollapsed, setIsFilterSidebarCollapsed] =
    useState(false);
  const [
    isSemanticFilterSidebarCollapsed,
    setIsSemanticFilterSidebarCollapsed,
  ] = useState(false);
  const [isProvinceListCollapsed, setIsProvinceListCollapsed] = useState(false);
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
  } = useOnSale(params, !isSemanticMode && activeTab === "all");
  const {
    data: favorites,
    isLoading: isFavLoading,
    isFetching: isFavFetching,
    isError: isFavError,
    refetch: refetchFavorites,
  } = useFavoriteProperties(
    params,
    !isSemanticMode && activeTab === "favorites",
  );
  const {
    data: semanticResponse,
    isLoading: isSemanticLoading,
    isFetching: isSemanticFetching,
    isError: isSemanticError,
    refetch: refetchSemantic,
  } = useSemanticPropertySearch(
    semanticRequest,
    isSemanticMode && hasSemanticQuery(semanticState),
  );

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
  const contextContent = useMemo(
    () => getContextContent(params, t),
    [params, t],
  );
  const semanticContextContent = useMemo(
    () => getSemanticContextContent(semanticState, semanticT),
    [semanticState, semanticT],
  );
  const semanticResults = semanticResponse?.data?.results || [];
  const hasSemanticResults = semanticResults.length > 0;
  const semanticFilterCount = useMemo(
    () => countSemanticFilters(semanticState),
    [semanticState],
  );

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
  const semanticSyncKey = useMemo(
    () =>
      JSON.stringify({
        query: semanticState.query,
        explain: semanticState.explain,
        filters: semanticState.filters,
      }),
    [semanticState],
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
  const provinceQuickOptions = useMemo(() => {
    const allProvinceOptions = LIST_PROVINCE.map((province) => ({
      label: province.label,
      value: province.value,
    }));

    const featuredOptions = allProvinceOptions.filter((province) => {
      const normalizedLabel = normalizeProvinceQuery(province.label);
      const normalizedValue = normalizeProvinceQuery(province.value);

      return FEATURED_PROVINCE_QUERIES.some(
        (query) =>
          normalizedLabel.includes(query) || normalizedValue.includes(query),
      );
    });

    return featuredOptions.length > 0
      ? featuredOptions
      : allProvinceOptions.slice(0, 12);
  }, []);
  const activeProvinceQuery = useMemo(
    () => normalizeProvinceQuery(params.query?.toString()),
    [params.query],
  );

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

  const replaceSemanticRoute = (nextState: SemanticSearchUrlState) => {
    const nextQuery = buildSemanticSearchQueryString(nextState);

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

  const handleSemanticPageChange = (page: number) => {
    replaceSemanticRoute({
      ...semanticState,
      page,
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

  const handleSemanticResetFilters = () => {
    replaceSemanticRoute({
      ...semanticState,
      page: 1,
      filters: {},
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

  const handleSemanticFilterChange = (
    filters: SemanticSearchUrlState["filters"],
  ) => {
    replaceSemanticRoute({
      ...semanticState,
      page: 1,
      filters: normalizeSemanticFilters(filters),
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

  const handleSemanticSearchChange = ({
    query,
    explain,
  }: {
    query: string;
    explain: boolean;
  }) => {
    replaceSemanticRoute({
      ...semanticState,
      query,
      explain,
      page: 1,
    });
  };

  const handleProvinceQuickSearch = (provinceLabel?: string) => {
    const nextSearchParams: PropertyFilters = {
      ...searchFiltersRef.current,
    };

    if (provinceLabel) {
      nextSearchParams.query = provinceLabel;
    } else {
      delete nextSearchParams.query;
    }

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

  const handleSearchModeChange = (mode: PropertySearchMode) => {
    if (mode === "standard") {
      replacePropertiesRoute(params, activeTab);
      return;
    }

    replaceSemanticRoute(buildSemanticStateFromStandardParams(params));
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
      <PropertySearchModeSwitch
        mode={searchMode}
        onChange={handleSearchModeChange}
      />

      {isSemanticMode ? (
        <SemanticSearchComposer
          initialQuery={semanticState.query}
          initialExplain={semanticState.explain}
          syncKey={semanticSyncKey}
          isSearching={isSemanticFetching}
          onSubmit={handleSemanticSearchChange}
        />
      ) : (
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
      )}

      <main className="container mx-auto px-4 py-8 md:px-20">
        <div className="flex flex-col gap-8 lg:flex-row">
          <div className="hidden lg:sticky lg:top-32 lg:flex lg:w-1/4 lg:self-start lg:flex-col lg:gap-6">
            {isSemanticMode ? (
              <SemanticSearchFilters
                sticky={false}
                onApply={handleSemanticFilterChange}
                onReset={handleSemanticResetFilters}
                initialFilters={semanticState.filters}
                collapsible
                collapsed={isSemanticFilterSidebarCollapsed}
                onCollapsedChange={setIsSemanticFilterSidebarCollapsed}
              />
            ) : (
              <>
                <FilterSidebar
                  sticky={false}
                  className="lg:block"
                  onReset={handleResetFilters}
                  onFilterChange={handleFilterChange}
                  initialFilters={initialSidebarFilters}
                  collapsible
                  collapsed={isFilterSidebarCollapsed}
                  onCollapsedChange={setIsFilterSidebarCollapsed}
                />

                {isAllTab ? (
                  <section className="overflow-hidden rounded-[28px] border border-stone-200 bg-white p-5 shadow-sm">
                    <div className="flex flex-col gap-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-stone-500">
                            {t("quickLocations.eyebrow")}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            setIsProvinceListCollapsed((prev) => !prev)
                          }
                          className="inline-flex items-center gap-1 rounded-full border border-stone-200 px-2.5 py-1 text-xs font-medium text-stone-600 transition-colors hover:border-stone-300 hover:bg-stone-50"
                        >
                          <ChevronDown
                            className={`h-3.5 w-3.5 transition-transform ${isProvinceListCollapsed ? "" : "rotate-180"}`}
                          />
                        </button>
                      </div>

                      {!isProvinceListCollapsed ? (
                        <p className="text-sm leading-6 text-stone-600">
                          {t("quickLocations.description")}
                        </p>
                      ) : null}
                    </div>

                    {!isProvinceListCollapsed ? (
                      <div className="mt-4 flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => handleProvinceQuickSearch()}
                          className={`rounded-full border px-3 py-2 text-xs font-medium transition-colors ${
                            !activeProvinceQuery
                              ? "border-stone-900 bg-stone-900 text-white"
                              : "border-stone-200 bg-stone-50 text-stone-700 hover:border-stone-300 hover:bg-stone-100"
                          }`}
                        >
                          {t("quickLocations.all")}
                        </button>

                        {provinceQuickOptions.map((province) => {
                          const isActive =
                            normalizeProvinceQuery(province.label) ===
                              activeProvinceQuery ||
                            normalizeProvinceQuery(province.value) ===
                              activeProvinceQuery;

                          return (
                            <button
                              key={province.value}
                              type="button"
                              onClick={() =>
                                handleProvinceQuickSearch(province.label)
                              }
                              className={`rounded-full border px-3 py-2 text-xs font-medium transition-colors ${
                                isActive
                                  ? "border-red-200 bg-red-50 text-red-600"
                                  : "border-stone-200 bg-white text-stone-700 hover:border-stone-300 hover:bg-stone-50"
                              }`}
                            >
                              {province.label}
                            </button>
                          );
                        })}
                      </div>
                    ) : null}
                  </section>
                ) : null}
              </>
            )}
          </div>

          <div className="flex-1" ref={gridRef}>
            <section className="mb-6 overflow-hidden rounded-[28px] border border-stone-200 bg-[linear-gradient(135deg,#f8f5ef_0%,#ffffff_58%,#efe7dc_100%)] p-6 shadow-sm">
              <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                <div className="max-w-2xl">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">
                    {isSemanticMode
                      ? semanticContextContent.eyebrow
                      : contextContent.eyebrow}
                  </p>
                  <h1 className="mt-2 text-3xl font-semibold tracking-tight text-stone-900">
                    {isSemanticMode
                      ? semanticContextContent.title
                      : contextContent.title}
                  </h1>
                  <p className="mt-3 text-sm leading-6 text-stone-600">
                    {isSemanticMode
                      ? semanticContextContent.description
                      : contextContent.description}
                  </p>
                </div>
                <span className="inline-flex w-fit rounded-full border border-stone-300 bg-white/80 px-4 py-2 text-sm font-medium text-stone-700">
                  {isSemanticMode
                    ? semanticContextContent.badge
                    : contextContent.badge}
                </span>
              </div>
            </section>

            {!isSemanticMode ? (
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
            ) : null}

            {!isSemanticMode && isAllTab ? (
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
              {!isSemanticMode ? (
                <>
                  <CsButton
                    type="button"
                    onClick={() => router.push(ROUTES.PROPERTY_MAP_SEARCH)}
                    className="h-11 rounded-xl bg-stone-900 px-4 text-sm font-semibold text-white hover:bg-stone-800"
                    icon={<SlidersHorizontal className="h-4 w-4" />}
                  >
                    {t("heading.mapSearch")}
                  </CsButton>

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
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsMobileFiltersOpen(true)}
                  className="flex h-11 items-center justify-between rounded-xl border border-gray-200 bg-white px-4 text-sm font-semibold text-gray-900 shadow-sm transition-colors hover:border-red-200 hover:bg-red-50/40"
                >
                  <span className="flex items-center gap-2">
                    <SlidersHorizontal className="h-4 w-4 text-red-500" />
                    {semanticT("filters.title")}
                  </span>
                  {semanticFilterCount > 0 ? (
                    <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-bold text-red-600">
                      {semanticFilterCount}
                    </span>
                  ) : (
                    <span className="text-xs font-medium text-gray-500">
                      Open
                    </span>
                  )}
                </button>
              )}
            </div>

            <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {isSemanticMode
                    ? semanticT("resultsTitle")
                    : isAllTab
                      ? t("heading.allTitle")
                      : t("heading.favTitle")}
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  {isSemanticMode ? (
                    isSemanticLoading ? (
                      <span className="inline-block h-4 w-48 animate-pulse rounded bg-gray-200" />
                    ) : hasSemanticQuery(semanticState) ? (
                      semanticT("resultsMeta", {
                        count: semanticResults.length,
                        total: semanticResponse?.data?.totalResults || 0,
                      })
                    ) : (
                      semanticT("resultsPlaceholder")
                    )
                  ) : currentLoading ? (
                    <span className="inline-block h-4 w-40 animate-pulse rounded bg-gray-200" />
                  ) : (
                    t("heading.showing", {
                      count: currentResults.length,
                      total: currentData?.data?.totalResults || 0,
                    })
                  )}
                </p>
              </div>

              {!isSemanticMode ? (
                <div className="hidden items-center gap-3 lg:flex">
                  <CsButton
                    type="button"
                    onClick={() => router.push(ROUTES.PROPERTY_MAP_SEARCH)}
                    className="rounded-xl bg-stone-900 px-4 text-sm font-semibold text-white hover:bg-stone-800"
                    icon={<SlidersHorizontal className="h-4 w-4" />}
                  >
                    {t("heading.mapSearch")}
                  </CsButton>

                  <span className="text-sm font-medium text-gray-500">
                    {t("sort.label")}
                  </span>
                  <div className="w-48">
                    <select
                      value={getSortValue(params)}
                      onChange={(event) => handleSortChange(event.target.value)}
                      className="h-10 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-700 outline-none transition focus:border-black"
                    >
                      <option value="newest">{t("sort.newest")}</option>
                      <option value="price_asc">
                        {t("sort.priceLowHigh")}
                      </option>
                      <option value="price_desc">
                        {t("sort.priceHighLow")}
                      </option>
                    </select>
                  </div>
                </div>
              ) : null}
            </div>

            {/* {isSemanticMode && hasSemanticQuery(semanticState) ? (
              <>
                {isSemanticLoading ? (
                  <section className="mb-6 animate-pulse rounded-[28px] border border-stone-200 bg-white p-5 shadow-sm">
                    <div className="h-3 w-32 rounded bg-stone-100" />
                    <div className="mt-4 h-8 w-2/3 rounded bg-stone-200" />
                    <div className="mt-3 h-4 w-full rounded bg-stone-100" />
                    <div className="mt-2 h-4 w-1/2 rounded bg-stone-100" />
                    <div className="mt-5 grid gap-3 sm:grid-cols-3">
                      {Array.from({ length: 3 }).map((_, index) => (
                        <div
                          key={`semantic-summary-skeleton-${index + 1}`}
                          className="rounded-2xl bg-stone-50 p-4"
                        >
                          <div className="h-3 w-20 rounded bg-stone-100" />
                          <div className="mt-3 h-6 w-14 rounded bg-stone-200" />
                        </div>
                      ))}
                    </div>
                  </section>
                ) : semanticResponse?.data ? (
                  <SemanticSearchSummary
                    className="mb-6"
                    data={semanticResponse.data}
                  />
                ) : null}
              </>
            ) : null} */}

            <div className="relative">
              {(
                isSemanticMode
                  ? isSemanticFetching && !isSemanticLoading
                  : currentFetching && !currentLoading
              ) ? (
                <div className="pointer-events-none absolute inset-0 z-10 flex items-start justify-center pt-32">
                  <div className="rounded-full bg-white/80 p-3 shadow-lg backdrop-blur-sm">
                    <Loader2 className="h-6 w-6 animate-spin text-red-600" />
                  </div>
                </div>
              ) : null}

              <div
                className={`grid grid-cols-1 gap-6 transition-opacity duration-300 md:grid-cols-2 xl:grid-cols-3 ${
                  isSemanticMode
                    ? isSemanticFetching && !isSemanticLoading
                      ? "opacity-50"
                      : "opacity-100"
                    : currentFetching && !currentLoading
                      ? "opacity-50"
                      : "opacity-100"
                }`}
              >
                {isSemanticMode
                  ? isSemanticLoading
                    ? PROPERTY_SKELETON_KEYS.map((key) => (
                        <PropertyCardSkeleton key={key} />
                      ))
                    : hasSemanticResults
                      ? semanticResults.map((result) => {
                          const property = normalizeSemanticProperty(
                            result.property,
                          );

                          return (
                            <PropertyCard
                              key={property._id}
                              id={property._id}
                              image={property.media.thumbnail}
                              title={property.title}
                              badges={{
                                aiRecommended: true,
                                tour3D:
                                  property.media.virtualTourUrls.length > 0,
                              }}
                              address={formatSemanticAddress(result.property)}
                              price={property.features.price.toString()}
                              currency={property.features.currency}
                              specs={{
                                beds: property.features.bedrooms,
                                baths: property.features.bathrooms,
                                area: property.features.area,
                              }}
                              unit={property.features.priceUnit}
                              agent={{
                                name: property.userId.fullName,
                                avatar: property.userId.avatarUrl,
                                isPro: property.userId.isPro,
                                plan: property.userId.plan,
                              }}
                              postedAt={formatPropertyPostedDate(
                                property.createdAt || new Date().toISOString(),
                                locale,
                              )}
                              type={
                                property.demandType?.toLowerCase() === "sale"
                                  ? "sale"
                                  : "rent"
                              }
                              isFavorite={property.isFavorite}
                              compareItem={mapPropertyToCompareItem(property)}
                              reasons={result.reasons}
                              scoreLabel={formatSemanticScoreLabel(
                                result.finalScore,
                              )}
                              ctaLabel={t("viewDetails")}
                            />
                          );
                        })
                      : null
                  : currentLoading
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
                            address={buildStandardPropertyAddress({
                              address: prop.location.address,
                              ward: prop.location.ward,
                              province: prop.location.province,
                            })}
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
                            type={
                              prop.demandType?.toLowerCase() === "sale"
                                ? "sale"
                                : "rent"
                            }
                            isFavorite={prop.isFavorite}
                            compareItem={mapPropertyToCompareItem(prop)}
                          />
                        ))
                      : null}
              </div>

              {isSemanticMode ? (
                <>
                  {!hasSemanticQuery(semanticState) ? (
                    <StateSurface
                      className="mt-2"
                      tone="brand"
                      eyebrow={semanticT("emptyQueryEyebrow")}
                      icon={<Search className="h-6 w-6" />}
                      title={semanticT("emptyQueryTitle")}
                      description={semanticT("emptyQueryDescription")}
                    />
                  ) : null}

                  {!isSemanticLoading &&
                  isSemanticError &&
                  !hasSemanticResults ? (
                    <StateSurface
                      className="mt-2"
                      tone="danger"
                      eyebrow={semanticT("errorEyebrow")}
                      icon={<AlertCircle className="h-6 w-6" />}
                      title={semanticT("errorTitle")}
                      description={semanticT("errorDescription")}
                      primaryAction={{
                        label: semanticT("retry"),
                        onClick: () => {
                          void refetchSemantic();
                        },
                      }}
                      secondaryAction={{
                        label: semanticT("clearFilters"),
                        onClick: () => {
                          handleSemanticResetFilters();
                        },
                        variant: "outline",
                      }}
                    />
                  ) : null}

                  {!isSemanticLoading &&
                  !isSemanticError &&
                  hasSemanticQuery(semanticState) &&
                  !hasSemanticResults ? (
                    <StateSurface
                      className="mt-2"
                      tone="brand"
                      eyebrow={semanticT("emptyEyebrow")}
                      icon={<House className="h-6 w-6" />}
                      title={semanticT("emptyTitle")}
                      description={semanticT("emptyDescription")}
                      primaryAction={{
                        label: semanticT("clearFilters"),
                        onClick: () => {
                          handleSemanticResetFilters();
                        },
                      }}
                      secondaryAction={{
                        label: semanticT("retry"),
                        onClick: () => {
                          void refetchSemantic();
                        },
                        variant: "outline" as const,
                      }}
                    />
                  ) : null}
                </>
              ) : (
                <>
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
                        label: isAllTab
                          ? "Clear filters"
                          : t("tabs.allProperties"),
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
                        label: isAllTab
                          ? "Reset filters"
                          : t("tabs.allProperties"),
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
                </>
              )}
            </div>

            {isSemanticMode ? (
              !isSemanticLoading &&
              !isSemanticError &&
              (semanticResponse?.data?.totalResults || 0) > 0 ? (
                <div className="mt-6 flex w-full justify-center">
                  <CsPagination
                    total={semanticResponse?.data?.totalResults || 0}
                    current={semanticResponse?.data?.page || 1}
                    pageSize={semanticResponse?.data?.limit || 8}
                    onChange={handleSemanticPageChange}
                    disabled={isSemanticFetching}
                  />
                </div>
              ) : null
            ) : !currentLoading &&
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
        title={isSemanticMode ? semanticT("filters.title") : t("filter.title")}
        from="bottom"
        footer={null}
        className="w-full max-w-none rounded-t-[28px] sm:max-w-lg"
      >
        <div className="space-y-3">
          <p className="text-sm text-gray-500">
            {isSemanticMode
              ? semanticT("filters.mobileDescription")
              : "Refine bedrooms, bathrooms, and orientation without losing your place in the results."}
          </p>

          {isSemanticMode ? (
            <SemanticSearchFilters
              sticky={false}
              className="border-none p-0"
              onApply={(filters) => {
                handleSemanticFilterChange(filters);
                setIsMobileFiltersOpen(false);
              }}
              onReset={handleSemanticResetFilters}
              initialFilters={semanticState.filters}
            />
          ) : (
            <FilterSidebar
              sticky={false}
              className="border-none p-0"
              onReset={handleResetFilters}
              onFilterChange={handleFilterChange}
              initialFilters={initialSidebarFilters}
            />
          )}
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
