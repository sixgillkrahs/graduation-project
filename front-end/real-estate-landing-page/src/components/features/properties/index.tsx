"use client";

import { CsPagination } from "@/components/custom";
import { CsSelect } from "@/components/ui/select";
import {
  LIST_PROVINCE,
  LIST_WARD,
  findOptionLabel,
  formatChatTime,
} from "gra-helper";
import AdvancedSearch from "./components/AdvancedSearch";
import FilterSidebar from "./components/FilterSidebar";
import PropertyCard from "./components/PropertyCard";
import PropertyCardSkeleton from "./components/PropertyCardSkeleton";
import { useOnSale } from "./services/query";
import { IParamsPagination } from "@/@types/service";
import { useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import { useRecordInteraction } from "./services/mutate";

const Properties = () => {
  const [params, setParams] = useState<IParamsPagination>({
    page: 1,
    limit: 6,
  });
  const { data: onSale, isLoading, isFetching } = useOnSale(params);
  const { mutateAsync: recordInteraction } = useRecordInteraction();
  const gridRef = useRef<HTMLDivElement>(null);

  const handlePageChange = (page: number) => {
    setParams({ ...params, page });
    gridRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleSaveProperty = async (id: string) => {
    await recordInteraction({ id, type: "FAVORITE" });
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <AdvancedSearch />

      <main className="container mx-auto px-4 md:px-20 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <FilterSidebar />

          <div className="flex-1" ref={gridRef}>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Properties for Sale in Hanoi
                </h1>
                <p className="text-gray-500 text-sm mt-1">
                  {isLoading ? (
                    <span className="inline-block h-4 w-40 bg-gray-200 rounded animate-pulse" />
                  ) : (
                    <>
                      Showing {onSale?.data?.results?.length} of{" "}
                      {onSale?.data?.totalResults} results
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
                    defaultValue="newest"
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
              {isFetching && !isLoading && (
                <div className="absolute inset-0 z-10 flex items-start justify-center pt-32 pointer-events-none">
                  <div className="bg-white/80 backdrop-blur-sm rounded-full p-3 shadow-lg">
                    <Loader2 className="w-6 h-6 text-red-600 animate-spin" />
                  </div>
                </div>
              )}

              <div
                className={`grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 transition-opacity duration-300 ${
                  isFetching && !isLoading ? "opacity-50" : "opacity-100"
                }`}
              >
                {isLoading
                  ? Array.from({ length: 6 }).map((_, i) => (
                      <PropertyCardSkeleton key={`skeleton-${i}`} />
                    ))
                  : onSale?.data?.results?.map((prop) => (
                      <PropertyCard
                        key={prop.id}
                        {...prop}
                        id={prop.id}
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
                      />
                    ))}
              </div>
            </div>

            {!isLoading && (
              <div className="mt-6 flex justify-center w-full">
                <CsPagination
                  total={onSale?.data?.totalResults || 0}
                  current={onSale?.data?.page || 1}
                  pageSize={onSale?.data?.limit || 6}
                  onChange={handlePageChange}
                  disabled={isFetching}
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
