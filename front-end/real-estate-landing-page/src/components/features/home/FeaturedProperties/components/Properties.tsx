"use client";

import { CsButton } from "@/components/custom";
import { Icon, Tag } from "@/components/ui";
import { useState } from "react";
import PropertyCard from "@/components/features/properties/components/PropertyCard";
import PropertyCardSkeleton from "@/components/features/properties/components/PropertyCardSkeleton";
import { useOnSale } from "@/components/features/properties/services/query";
import {
  LIST_PROVINCE,
  LIST_WARD,
  findOptionLabel,
  formatChatTime,
} from "gra-helper";

const categories = [
  { name: "All", value: "" },
  { name: "Apartments", value: "APARTMENT" },
  { name: "Villa", value: "VILLA" },
  { name: "House", value: "HOUSE" },
  { name: "Land", value: "LAND" },
  { name: "Other", value: "OTHER" },
];

const Properties = () => {
  const [activeCategory, setActiveCategory] = useState(categories[0]);
  const [page, setPage] = useState(1);
  const limit = 3; // Show 3 properties per page for top featured

  const { data, isLoading } = useOnSale({
    page,
    limit,
    ...(activeCategory.value ? { propertyType: activeCategory.value } : {}),
  });

  const totalPages = Math.ceil((data?.data?.totalResults || 0) / limit);

  const handlePrev = () => {
    if (page > 1) setPage(page - 1);
  };

  const handleNext = () => {
    if (page < totalPages) setPage(page + 1);
  };

  return (
    <>
      <div className="flex flex-col md:flex-row justify-between items-center">
        <div className="flex flex-wrap gap-2 mb-4 md:mb-0">
          {categories.map((category) => (
            <Tag
              key={category.name}
              title={category.name}
              className={`bg-black/10 main-color-black font-medium border-none ${
                activeCategory.name === category.name
                  ? "outline outline-1 outline-black"
                  : ""
              }`}
              onClick={() => {
                setActiveCategory(category);
                setPage(1); // Reset to first page when changing categories
              }}
            />
          ))}
        </div>
        <div className="flex gap-2">
          <CsButton
            className={`font-medium border-none rounded-full transition-opacity ${page === 1 ? "opacity-30 cursor-not-allowed" : ""}`}
            icon={<Icon.ArrowLeft />}
            onClick={handlePrev}
            disabled={page === 1 || isLoading}
          />
          <CsButton
            className={`font-medium border-none rounded-full transition-opacity ${page === totalPages || totalPages === 0 ? "opacity-30 cursor-not-allowed" : ""}`}
            icon={<Icon.ArrowRight />}
            onClick={handleNext}
            disabled={page === totalPages || totalPages === 0 || isLoading}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8 min-h-[400px]">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <PropertyCardSkeleton key={i} />
          ))
        ) : data?.data?.results?.length ? (
          data.data.results.map((prop) => (
            <PropertyCard
              key={prop._id}
              id={prop._id}
              image={prop.media.thumbnail}
              title={prop.title}
              badges={{
                aiRecommended: false,
                tour3D: prop.media.virtualTourUrls?.length > 0,
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
          ))
        ) : (
          <div className="col-span-1 md:col-span-3 py-10 flex flex-col items-center justify-center text-gray-500">
            <span className="text-lg font-semibold">No properties found</span>
            <span className="text-sm">
              Try changing the category to see more results
            </span>
          </div>
        )}
      </div>

      {totalPages > 0 && (
        <div className="flex justify-center items-center gap-2 my-8 h-12">
          {Array.from({ length: totalPages }).map((_, idx) => {
            const item = idx + 1;
            const active = page === item;
            return (
              <div
                key={item}
                onClick={() => setPage(item)}
                className={`relative cursor-pointer rounded-full transition-all ${
                  active
                    ? "size-3 bg-black"
                    : "size-2 bg-black/20 hover:bg-black/40"
                }`}
              >
                {active && (
                  <span className="absolute inset-px rounded-full border border-white" />
                )}
              </div>
            );
          })}
        </div>
      )}
    </>
  );
};

export default Properties;
