"use client";

import {
  formatChatTime,
  findOptionLabel,
  LIST_PROVINCE,
  LIST_WARD,
} from "gra-helper";
import { useTranslations } from "next-intl";
import { CsButton } from "@/components/custom";
import PropertyCard from "@/components/features/properties/components/PropertyCard";
import PropertyCardSkeleton from "@/components/features/properties/components/PropertyCardSkeleton";
import { PropertyDto } from "../dto/property.dto";

interface RecommendedPropertiesSectionProps {
  properties: Array<PropertyDto & { isFavorite: boolean }>;
  isLoading: boolean;
  canLoadMore: boolean;
  onLoadMore: () => void;
}

const RecommendedPropertiesSection = ({
  properties,
  isLoading,
  canLoadMore,
  onLoadMore,
}: RecommendedPropertiesSectionProps) => {
  const t = useTranslations("PropertiesPage");

  if (!isLoading && properties.length === 0) {
    return null;
  }

  return (
    <section className="mt-20 border-t border-border pt-10">
      <div className="mb-8 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">
          {t("detail.similarHomes")}
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
        {isLoading
          ? Array.from({ length: 3 }).map((_, index) => (
              <PropertyCardSkeleton key={`recommended-skeleton-${index + 1}`} />
            ))
          : properties.map((property) => (
              <PropertyCard
                key={property._id}
                id={property._id}
                image={property.media?.thumbnail || property.media?.images?.[0]}
                title={property.title}
                badges={{
                  aiRecommended: true,
                  tour3D: property.media?.virtualTourUrls?.length > 0,
                }}
                address={`${property.location?.address}, ${findOptionLabel(property.location?.ward, LIST_WARD)}, ${findOptionLabel(property.location?.province, LIST_PROVINCE)}`}
                price={property.features?.price?.toString()}
                currency={property.features?.currency}
                specs={{
                  beds: property.features?.bedrooms,
                  baths: property.features?.bathrooms,
                  area: property.features?.area,
                }}
                unit={property.features?.priceUnit}
                agent={{
                  name: property.userId?.fullName,
                  avatar: property.userId?.avatarUrl,
                }}
                postedAt={formatChatTime(property.createdAt)}
                type={property.demandType === "sale" ? "sale" : "rent"}
                isFavorite={property.isFavorite}
              />
            ))}
      </div>

      {!isLoading && canLoadMore && (
        <div className="mt-8 flex justify-center">
          <CsButton type="button" variant="outline" onClick={onLoadMore}>
            {t("detail.viewMore")}
          </CsButton>
        </div>
      )}
    </section>
  );
};

export default RecommendedPropertiesSection;
