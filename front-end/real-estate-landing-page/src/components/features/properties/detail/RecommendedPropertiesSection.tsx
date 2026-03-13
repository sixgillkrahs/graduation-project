"use client";

import { findOptionLabel, LIST_PROVINCE, LIST_WARD } from "gra-helper";
import { AlertCircle, House } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { CsButton } from "@/components/custom";
import { mapPropertyToCompareItem } from "@/components/features/properties/compare/compare.utils";
import PropertyCard from "@/components/features/properties/components/PropertyCard";
import PropertyCardSkeleton from "@/components/features/properties/components/PropertyCardSkeleton";
import StateSurface from "@/components/ui/state-surface";
import { formatPropertyPostedDate } from "@/lib/property-date";
import type { PropertyDto } from "../dto/property.dto";

interface RecommendedPropertiesSectionProps {
  properties: Array<PropertyDto & { isFavorite: boolean }>;
  isLoading: boolean;
  isError: boolean;
  canLoadMore: boolean;
  onLoadMore: () => void;
  onRetry: () => void;
}

const RecommendedPropertiesSection = ({
  properties,
  isLoading,
  isError,
  canLoadMore,
  onLoadMore,
  onRetry,
}: RecommendedPropertiesSectionProps) => {
  const t = useTranslations("PropertiesPage");
  const locale = useLocale();

  return (
    <section className="mt-20 border-t border-border pt-10">
      <div className="mb-8 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">
          {t("detail.similarHomes")}
        </h2>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <PropertyCardSkeleton key={`recommended-skeleton-${index + 1}`} />
          ))}
        </div>
      ) : isError && properties.length === 0 ? (
        <StateSurface
          size="compact"
          tone="danger"
          eyebrow="Similar Homes"
          icon={<AlertCircle className="h-5 w-5" />}
          title="Could not load similar properties"
          description="Recommendations are temporarily unavailable. You can retry without leaving this page."
          primaryAction={{ label: "Try again", onClick: onRetry }}
        />
      ) : properties.length === 0 ? (
        <StateSurface
          size="compact"
          tone="brand"
          eyebrow="Similar Homes"
          icon={<House className="h-5 w-5" />}
          title="No similar properties yet"
          description="We do not have a close match to show right now. Explore the broader property feed for more options."
          primaryAction={{
            label: "Refresh recommendations",
            onClick: onRetry,
            variant: "outline",
          }}
        />
      ) : (
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {properties.map((property) => (
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
              postedAt={formatPropertyPostedDate(property.createdAt, locale)}
              type={property.demandType === "sale" ? "sale" : "rent"}
              isFavorite={property.isFavorite}
              compareItem={mapPropertyToCompareItem(property)}
            />
          ))}
        </div>
      )}

      {!isLoading && !isError && canLoadMore && (
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
