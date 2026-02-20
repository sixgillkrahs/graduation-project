"use client";

import { IParamsPagination } from "@/@types/service";
import { CsPagination } from "@/components/custom";
import { CsSelect } from "@/components/ui/select";
import {
  LIST_PROVINCE,
  LIST_WARD,
  findOptionLabel,
  formatChatTime,
} from "gra-helper";
import { Heart, Loader2, Search } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import AdvancedSearch from "./components/AdvancedSearch";
import FilterSidebar from "./components/FilterSidebar";
import PropertyCard from "./components/PropertyCard";
import PropertyCardSkeleton from "./components/PropertyCardSkeleton";
import { useFavoriteProperties, useOnSale } from "./services/query";

type TabType = "all" | "favorites";

const Properties = () => {
  const searchParams = useSearchParams();
  const router = useRouter();

  // URL is the single source of truth for the active tab
  const activeTab: TabType =
    searchParams.get("tab") === "favorites" ? "favorites" : "all";

  // Single shared filter state for both tabs
  const [params, setParams] = useState<IParamsPagination>({
    page: 1,
    limit: 6,
  });

  const { data: onSale, isLoading, isFetching } = useOnSale(params);
  const {
    data: favorites,
    isLoading: isFavLoading,
    isFetching: isFavFetching,
  } = useFavoriteProperties(params);

  const gridRef = useRef<HTMLDivElement>(null);

  const isAllTab = activeTab === "all";
  const currentData = isAllTab ? onSale : favorites;
  const currentLoading = isAllTab ? isLoading : isFavLoading;
  const currentFetching = isAllTab ? isFetching : isFavFetching;

  const handlePageChange = (page: number) => {
    setParams((prev) => ({ ...prev, page }));
    gridRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleTabChange = (tab: TabType) => {
    // Reset to page 1 when switching tabs, keep filters
    setParams((prev) => ({ ...prev, page: 1 }));
    if (tab === "favorites") {
      router.replace("/properties?tab=favorites", { scroll: false });
    } else {
      router.replace("/properties", { scroll: false });
    }
  };

  const handleResetFilters = () => {
    setParams({ page: 1, limit: 6 });
  };

  const handleFilterChange = (filters: Record<string, any>) => {
    setParams((prev) => {
      // Strip old filter keys (keep only page & limit)
      const { page, limit } = prev;
      return { page: 1, limit, ...filters };
    });
  };

  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    setIsLoggedIn(localStorage.getItem("isLoggedIn") === "true");
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <AdvancedSearch />

      <main className="container mx-auto px-4 md:px-20 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <FilterSidebar
            onReset={handleResetFilters}
            onFilterChange={handleFilterChange}
          />

          <div className="flex-1" ref={gridRef}>
            {/* Tabs */}
            <div className="flex items-center gap-1 mb-6 bg-gray-100 rounded-xl p-1 w-fit">
              <button
                onClick={() => handleTabChange("all")}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  isAllTab
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <Search className="w-4 h-4" />
                All Properties
              </button>
              {isLoggedIn && (
                <button
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
                  My Favorites
                  {favorites?.data?.totalResults !== undefined &&
                    favorites.data.totalResults > 0 && (
                      <span className="bg-red-100 text-red-600 text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
                        {favorites.data.totalResults}
                      </span>
                    )}
                </button>
              )}
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {isAllTab
                    ? "Properties for Sale in Hanoi"
                    : "My Favorite Properties"}
                </h1>
                <p className="text-gray-500 text-sm mt-1">
                  {currentLoading ? (
                    <span className="inline-block h-4 w-40 bg-gray-200 rounded animate-pulse" />
                  ) : (
                    <>
                      Showing {currentData?.data?.results?.length || 0} of{" "}
                      {currentData?.data?.totalResults || 0} results
                    </>
                  )}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-gray-500 text-sm font-medium">
                  Sort by:
                </span>
                <div className="w-48">
                  <CsSelect
                    placeholder="Sort"
                    value={
                      params.sortField === "features.price"
                        ? params.sortOrder === "asc"
                          ? "price_asc"
                          : "price_desc"
                        : "newest"
                    }
                    onChange={(val: string) => {
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
                            const { sortField, sortOrder, ...rest } = prev;
                            return { ...rest, page: 1 };
                          });
                          break;
                      }
                    }}
                    options={[
                      { value: "newest", label: "Newest" },
                      { value: "price_asc", label: "Price: Low to High" },
                      { value: "price_desc", label: "Price: High to Low" },
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
                  ? Array.from({ length: 6 }).map((_, i) => (
                      <PropertyCardSkeleton key={`skeleton-${i}`} />
                    ))
                  : currentData?.data?.results?.length === 0 && !isAllTab
                    ? null
                    : currentData?.data?.results?.map((prop) => (
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
                          postedAt={formatChatTime(prop.createdAt)}
                          type={prop.demandType === "sale" ? "sale" : "rent"}
                          isFavorite={prop.isFavorite}
                        />
                      ))}
              </div>

              {/* Empty state for favorites */}
              {!currentLoading &&
                !isAllTab &&
                currentData?.data?.results?.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center mb-4">
                      <Heart className="w-10 h-10 text-red-300" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">
                      No favorites yet
                    </h3>
                    <p className="text-gray-500 text-sm max-w-sm">
                      Start exploring properties and tap the heart icon to save
                      your favorites here.
                    </p>
                    <button
                      onClick={() => handleTabChange("all")}
                      className="mt-6 px-6 py-2.5 bg-gray-900 text-white rounded-full text-sm font-semibold hover:bg-gray-800 transition-colors"
                    >
                      Explore Properties
                    </button>
                  </div>
                )}
            </div>

            {!currentLoading && (currentData?.data?.totalResults || 0) > 0 && (
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
    </div>
  );
};

export default Properties;
